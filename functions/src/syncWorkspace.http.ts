import * as admin from 'firebase-admin';
import { onRequest, HttpsOptions } from 'firebase-functions/v2/https';
import * as cryptoJs from 'crypto-js';
import { AuditAction, logSuccess, logFailure } from './utils/auditLog';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '';
const HOSTINGER_API_BASE = 'https://developers.hostinger.com';

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
    throw new Error('Failed to decrypt token');
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
    throw new Error(`Hostinger API error: ${response.status}`);
  }

  const data = await response.json();
  return data.data || [];
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
    throw new Error(`Hostinger API error: ${response.status}`);
  }

  const data = await response.json();
  return data.data || [];
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
    await domainsRef.add(domainData);
  } else {
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

  const snapshot = await subscriptionsRef
    .where('workspaceId', '==', workspaceId)
    .where('subscriptionId', '==', subscription.id)
    .limit(1)
    .get();

  const subscriptionData = {
    workspaceId,
    subscriptionId: subscription.id,
    productName: subscription.product_name,
    expiresAt: admin.firestore.Timestamp.fromDate(new Date(subscription.expires_at)),
    nextBillingAt: subscription.next_billing_at
      ? admin.firestore.Timestamp.fromDate(new Date(subscription.next_billing_at))
      : null,
    autoRenew: subscription.auto_renew || false,
    status: subscription.status,
    raw: subscription,
    syncedAt: new Date(),
  };

  if (snapshot.empty) {
    await subscriptionsRef.add(subscriptionData);
  } else {
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

/**
 * Sync Workspace (HTTP Function)
 *
 * HTTP endpoint to synchronize domains and subscriptions
 * Handles CORS manually for localhost and production origins
 *
 * Security: Validates Firebase Auth ID token from Authorization header
 * Last updated: 2026-01-08 - Converted from onCall to onRequest for CORS control
 */
const httpOptions: HttpsOptions = {
  region: 'us-central1',
  cors: [
    'http://localhost:4200',
    'https://hostinger-workspace-manager.web.app',
    'https://hostinger-workspace-manager.firebaseapp.com',
  ],
};

export const syncWorkspace = onRequest(httpOptions, async (req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  // Only allow POST
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // Verify authentication
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
    return;
  }

  const idToken = authHeader.split('Bearer ')[1];
  let userId = '';

  try {
    // Verify Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    userId = decodedToken.uid;
    console.log('Authenticated user:', userId);
  } catch (error) {
    console.error('Token verification failed:', error);
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
    return;
  }

  const { workspaceId } = req.body;

  if (!workspaceId) {
    res.status(400).json({ error: 'workspaceId is required' });
    return;
  }

  let syncRunId: string | null = null;

  try {
    // Create sync run record
    syncRunId = await createSyncRun(workspaceId);

    // Get workspace
    const db = admin.firestore();
    const workspaceDoc = await db.collection('workspaces').doc(workspaceId).get();

    if (!workspaceDoc.exists) {
      res.status(404).json({ error: 'Workspace not found' });
      return;
    }

    const workspace = workspaceDoc.data();
    if (!workspace?.encryptedToken) {
      res.status(400).json({ error: 'Workspace has no API token' });
      return;
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

    console.log('Sync completed', {
      workspaceId,
      domains: domains.length,
      subscriptions: subscriptions.length,
    });

    // Log successful sync to audit logs
    await logSuccess(
      AuditAction.SYNC_MANUAL,
      userId,
      workspaceId,
      {
        domainsProcessed: domains.length,
        subscriptionsProcessed: subscriptions.length,
        syncRunId,
      }
    );

    res.status(200).json({
      success: true,
      syncRunId,
      domainsProcessed: domains.length,
      subscriptionsProcessed: subscriptions.length,
    });
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

    // Log failed sync to audit logs
    try {
      await logFailure(
        AuditAction.SYNC_MANUAL,
        userId,
        errorMessage,
        workspaceId,
        { syncRunId: syncRunId || 'none' }
      );
    } catch (auditError) {
      console.error('Failed to log audit entry:', auditError);
    }

    res.status(500).json({ error: errorMessage });
  }
});
