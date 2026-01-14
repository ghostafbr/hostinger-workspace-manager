import * as admin from 'firebase-admin';
import { onRequest, HttpsOptions } from 'firebase-functions/v2/https';
import * as cryptoJs from 'crypto-js';
import { AuditAction, logSuccess, logFailure } from '../../utils/auditLog';

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

interface RateLimitInfo {
  requests: number;
  remaining: number;
  limit: number;
  resetTime: Date;
  percentage: number;
}

/**
 * Extract rate limit information from response headers
 */
function extractRateLimitHeaders(headers: Headers): RateLimitInfo | null {
  try {
    // Standard rate limit headers from Hostinger API
    const limit = parseInt(headers.get('x-ratelimit-limit') || headers.get('ratelimit-limit') || '1000', 10);
    const remaining = parseInt(headers.get('x-ratelimit-remaining') || headers.get('ratelimit-remaining') || '1000', 10);
    const reset = parseInt(headers.get('x-ratelimit-reset') || headers.get('ratelimit-reset') || '0', 10);

    if (!limit || !remaining) {
      return null;
    }

    const requests = limit - remaining;
    const percentage = Math.round((requests / limit) * 100);
    const resetTime = reset > 0 ? new Date(reset * 1000) : new Date(Date.now() + 3600000); // Default 1 hour

    return {
      requests,
      remaining,
      limit,
      resetTime,
      percentage,
    };
  } catch (error) {
    console.error('Error extracting rate limit headers:', error);
    return null;
  }
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
 * Fetch domains from Hostinger API and capture rate limit headers
 */
async function fetchDomains(
  apiToken: string
): Promise<{ data: HostingerDomainResponse[]; rateLimit: RateLimitInfo | null }> {
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
  const rateLimit = extractRateLimitHeaders(response.headers);

  return { data: data.data || [], rateLimit };
}

/**
 * Fetch subscriptions from Hostinger API and capture rate limit headers
 */
async function fetchSubscriptions(
  apiToken: string
): Promise<{ data: HostingerSubscriptionResponse[]; rateLimit: RateLimitInfo | null }> {
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
  const rateLimit = extractRateLimitHeaders(response.headers);

  return { data: data.data || [], rateLimit };
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
 * Save rate limit info to Firestore
 */
async function saveRateLimitInfo(workspaceId: string, rateLimit: RateLimitInfo): Promise<void> {
  const db = admin.firestore();
  const rateLimitRef = db.collection('rateLimits').doc(workspaceId);

  await rateLimitRef.set(
    {
      workspaceId,
      requests: rateLimit.requests,
      remaining: rateLimit.remaining,
      limit: rateLimit.limit,
      resetTime: admin.firestore.Timestamp.fromDate(rateLimit.resetTime),
      percentage: rateLimit.percentage,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  console.log('Rate limit saved:', { workspaceId, ...rateLimit });
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

    // Fetch and sync domains (capture rate limits)
    console.log('Fetching domains...', { workspaceId });
    const domainsResult = await fetchDomains(apiToken);

    for (const domain of domainsResult.data) {
      await upsertDomain(workspaceId, domain);
    }

    // Fetch and sync subscriptions (capture rate limits)
    console.log('Fetching subscriptions...', { workspaceId });
    const subscriptionsResult = await fetchSubscriptions(apiToken);

    for (const subscription of subscriptionsResult.data) {
      await upsertSubscription(workspaceId, subscription);
    }

    // Save rate limit info (use the latest from subscriptions call)
    if (subscriptionsResult.rateLimit) {
      await saveRateLimitInfo(workspaceId, subscriptionsResult.rateLimit);
    }

    // Update sync run - success
    await updateSyncRun(syncRunId, {
      status: 'completed',
      endAt: new Date(),
      domainsProcessed: domainsResult.data.length,
      subscriptionsProcessed: subscriptionsResult.data.length,
    });

    // Update workspace
    await workspaceDoc.ref.update({
      lastSyncAt: new Date(),
      lastSyncStatus: 'success',
      lastError: null,
    });

    console.log('Sync completed', {
      workspaceId,
      domains: domainsResult.data.length,
      subscriptions: subscriptionsResult.data.length,
    });

    // Log successful sync to audit logs
    await logSuccess(
      AuditAction.SYNC_MANUAL,
      userId,
      workspaceId,
      {
        domainsProcessed: domainsResult.data.length,
        subscriptionsProcessed: subscriptionsResult.data.length,
        syncRunId,
      }
    );

    res.status(200).json({
      success: true,
      syncRunId,
      domainsProcessed: domainsResult.data.length,
      subscriptionsProcessed: subscriptionsResult.data.length,
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
