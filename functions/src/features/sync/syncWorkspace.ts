import * as admin from 'firebase-admin';
import { onCall, HttpsError, CallableOptions } from 'firebase-functions/v2/https';
import * as cryptoJs from 'crypto-js';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '';
const HOSTINGER_API_BASE = 'https://developers.hostinger.com';

interface SyncResult {
  success: boolean;
  syncRunId?: string;
  domainsProcessed?: number;
  subscriptionsProcessed?: number;
  error?: string;
}

interface HostingerDomainResponse {
  id: string;
  domain: string;
  expires_at: string;
  created_at: string;
  nameservers: string[];
  locked: boolean;
  privacy: boolean;
}

interface HostingerSubscriptionResponse {
  id: string;
  product_name: string;
  expires_at: string;
  next_billing_at?: string;
  auto_renew: boolean;
  status: string;
}

/**
 * Decrypt Hostinger API token
 */
function decryptToken(encryptedToken: string): string {
  try {
    const bytes = cryptoJs.AES.decrypt(encryptedToken, ENCRYPTION_KEY);
    return bytes.toString(cryptoJs.enc.Utf8);
  } catch (error) {
    console.error('Token decryption failed', error);
    throw new HttpsError('internal', 'Failed to decrypt token');
  }
}

/**
 * Fetch domains from Hostinger API
 */
async function fetchDomains(apiToken: string): Promise<HostingerDomainResponse[]> {
  const response = await fetch(`${HOSTINGER_API_BASE}/api/domains/v1/portfolio`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Hostinger API error (domains)', { status: response.status, error });
    throw new HttpsError('unavailable', `Hostinger API error: ${response.status}`);
  }

  const data = await response.json();

  // Handle different response formats from Hostinger API
  if (Array.isArray(data)) {
    return data;
  }
  if (data.data && Array.isArray(data.data)) {
    return data.data;
  }
  if (data.results && Array.isArray(data.results)) {
    return data.results;
  }
  if (data.domains && Array.isArray(data.domains)) {
    return data.domains;
  }

  return [];
}

/**
 * Fetch subscriptions from Hostinger API
 */
async function fetchSubscriptions(apiToken: string): Promise<HostingerSubscriptionResponse[]> {
  const response = await fetch(`${HOSTINGER_API_BASE}/api/billing/v1/subscriptions`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Hostinger API error (subscriptions)', { status: response.status, error });
    throw new HttpsError('unavailable', `Hostinger API error: ${response.status}`);
  }

  const data = await response.json();

  // Handle different response formats from Hostinger API
  if (Array.isArray(data)) {
    return data;
  }
  if (data.data && Array.isArray(data.data)) {
    return data.data;
  }
  if (data.results && Array.isArray(data.results)) {
    return data.results;
  }
  if (data.subscriptions && Array.isArray(data.subscriptions)) {
    return data.subscriptions;
  }

  return [];
}

/**
 * Upsert domain in Firestore (idempotent by domainName)
 */
async function upsertDomain(
  workspaceId: string,
  domain: HostingerDomainResponse
): Promise<void> {
  const db = admin.firestore();
  const domainsRef = db.collection('domains');

  // Find existing domain by workspace + domain name
  const snapshot = await domainsRef
    .where('workspaceId', '==', workspaceId)
    .where('domainName', '==', domain.domain)
    .limit(1)
    .get();

  const domainData = {
    workspaceId,
    domainName: domain.domain,
    expiresAt: admin.firestore.Timestamp.fromDate(new Date(domain.expires_at)),
    createdAt: admin.firestore.Timestamp.fromDate(new Date(domain.created_at)),
    nameservers: domain.nameservers || [],
    domainLock: domain.locked || false,
    privacyProtection: domain.privacy || false,
    raw: domain,
    syncedAt: new Date(),
  };

  if (snapshot.empty) {
    // Create new
    await domainsRef.add(domainData);
  } else {
    // Update existing
    await snapshot.docs[0].ref.update(domainData);
  }
}

/**
 * Upsert subscription in Firestore (idempotent by subscriptionId)
 */
async function upsertSubscription(
  workspaceId: string,
  subscription: HostingerSubscriptionResponse
): Promise<void> {
  const db = admin.firestore();
  const subscriptionsRef = db.collection('subscriptions');

  // Find existing subscription by workspace + subscription ID
  const snapshot = await subscriptionsRef
    .where('workspaceId', '==', workspaceId)
    .where('subscriptionId', '==', subscription.id)
    .limit(1)
    .get();

  const subscriptionData = {
    workspaceId,
    subscriptionId: subscription.id,
    productName: subscription.product_name || subscription.id || 'Unknown Product',
    expiresAt: admin.firestore.Timestamp.fromDate(new Date(subscription.expires_at)),
    nextBillingAt: subscription.next_billing_at
      ? admin.firestore.Timestamp.fromDate(new Date(subscription.next_billing_at))
      : null,
    autoRenew: subscription.auto_renew || false,
    status: subscription.status || 'unknown',
    raw: subscription,
    syncedAt: new Date(),
  };

  if (snapshot.empty) {
    // Create new
    await subscriptionsRef.add(subscriptionData);
  } else {
    // Update existing
    await snapshot.docs[0].ref.update(subscriptionData);
  }
}

/**
 * Create sync run record
 */
async function createSyncRun(workspaceId: string): Promise<string> {
  const db = admin.firestore();
  const syncRunRef = await db.collection('sync_runs').add({
    workspaceId,
    startAt: new Date(),
    status: 'running',
    domainsProcessed: 0,
    subscriptionsProcessed: 0,
    errors: [],
  });

  return syncRunRef.id;
}

/**
 * Update sync run record
 */
async function updateSyncRun(
  syncRunId: string,
  data: Partial<{
    status: string;
    endAt: Date;
    domainsProcessed: number;
    subscriptionsProcessed: number;
    errors: string[];
  }>
): Promise<void> {
  const db = admin.firestore();
  await db.collection('sync_runs').doc(syncRunId).update(data);
}

interface SyncRequestData {
  workspaceId: string;
}

/**
 * Sync Workspace
 *
 * Callable function to synchronize domains and subscriptions
 * for a specific workspace
 *
 * Configuration:
 * - invoker: 'public' allows any authenticated Firebase user to call
 * - region: 'us-central1' for optimal performance
 * - CORS is handled automatically by Firebase Callable Functions
 *
 * Security: The function validates Firebase Auth token in the handler
 * Last updated: 2026-01-08 - Removed invalid CORS config (onCall handles it)
 */
const callableOptions: CallableOptions = {
  invoker: 'public',
  region: 'us-central1',
};

export const syncWorkspace = onCall(callableOptions, async (request) => {
  // Verify authentication
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { workspaceId } = request.data as SyncRequestData;

  if (!workspaceId) {
    throw new HttpsError('invalid-argument', 'workspaceId is required');
  }

  const result: SyncResult = {
    success: false,
  };

  let syncRunId: string | null = null;

  try {
    // Create sync run record
    syncRunId = await createSyncRun(workspaceId);
    result.syncRunId = syncRunId;

    // Get workspace
    const db = admin.firestore();
    const workspaceDoc = await db.collection('workspaces').doc(workspaceId).get();

    if (!workspaceDoc.exists) {
      throw new HttpsError('not-found', 'Workspace not found');
    }

    const workspace = workspaceDoc.data();
    if (!workspace?.encryptedToken) {
      throw new HttpsError('failed-precondition', 'Workspace has no API token');
    }

    // Decrypt token
    const apiToken = decryptToken(workspace.encryptedToken);

    // Fetch and sync domains
    console.log('Fetching domains...', { workspaceId });
    const domains = await fetchDomains(apiToken);

    for (const domain of domains) {
      await upsertDomain(workspaceId, domain);
    }

    // Fetch and sync subscriptions
    console.log('Fetching subscriptions...', { workspaceId });
    const subscriptions = await fetchSubscriptions(apiToken);

    for (const subscription of subscriptions) {
      await upsertSubscription(workspaceId, subscription);
    }

    // Update sync run - success
    await updateSyncRun(syncRunId, {
      status: 'completed',
      endAt: new Date(),
      domainsProcessed: domains.length,
      subscriptionsProcessed: subscriptions.length,
    });

    // Update workspace
    await workspaceDoc.ref.update({
      lastSyncAt: new Date(),
      lastSyncStatus: 'success',
      lastError: null,
    });

    result.success = true;
    result.domainsProcessed = domains.length;
    result.subscriptionsProcessed = subscriptions.length;

    console.log('Sync completed', {
      workspaceId,
      domains: domains.length,
      subscriptions: subscriptions.length,
    });

    return result;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Sync failed', { workspaceId, error });

    // Update sync run - failed
    if (syncRunId) {
      await updateSyncRun(syncRunId, {
        status: 'failed',
        endAt: new Date(),
        errors: [errorMessage],
      });
    }

    // Update workspace
    const db = admin.firestore();
    await db.collection('workspaces').doc(workspaceId).update({
      lastSyncAt: new Date(),
      lastSyncStatus: 'failed',
      lastError: errorMessage,
    });

    result.error = errorMessage;
    throw error;
  }
});
