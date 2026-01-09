import * as admin from 'firebase-admin';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { onRequest, HttpsOptions } from 'firebase-functions/v2/https';
import * as cryptoJs from 'crypto-js';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '';
const HOSTINGER_API_BASE = 'https://developers.hostinger.com';

// Circuit breaker configuration
const MAX_CONSECUTIVE_ERRORS = 3;
const RATE_LIMIT_DELAY_MS = 2000; // 2 seconds between workspace syncs

interface SyncAllResult {
  totalWorkspaces: number;
  successCount: number;
  failureCount: number;
  skippedCount: number;
  disabledCount: number;
  details: {
    workspaceId: string;
    status: 'success' | 'failed' | 'skipped' | 'disabled';
    domainsProcessed?: number;
    subscriptionsProcessed?: number;
    error?: string;
  }[];
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
async function createSyncRun(workspaceId: string, trigger: 'manual' | 'scheduled'): Promise<string> {
  const db = admin.firestore();
  const syncRunRef = await db.collection('sync_runs').add({
    workspaceId,
    trigger,
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
 * Sync individual workspace
 */
async function syncSingleWorkspace(
  workspaceId: string,
  workspaceData: FirebaseFirestore.DocumentData,
  trigger: 'manual' | 'scheduled'
): Promise<{
  success: boolean;
  domainsProcessed: number;
  subscriptionsProcessed: number;
  error?: string;
}> {
  let syncRunId: string | null = null;

  try {
    // Create sync run record
    syncRunId = await createSyncRun(workspaceId, trigger);

    // Check if workspace has API token
    if (!workspaceData?.encryptedToken) {
      throw new Error('Workspace has no API token');
    }

    // Decrypt token
    const apiToken = decryptToken(workspaceData.encryptedToken);

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

    // Update workspace - success
    const db = admin.firestore();
    await db.collection('workspaces').doc(workspaceId).update({
      lastSyncAt: new Date(),
      lastSyncStatus: 'success',
      lastError: null,
      consecutiveErrors: 0, // Reset circuit breaker counter
    });

    console.log('Sync completed', {
      workspaceId,
      domains: domains.length,
      subscriptions: subscriptions.length,
    });

    return {
      success: true,
      domainsProcessed: domains.length,
      subscriptionsProcessed: subscriptions.length,
    };
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

    // Update workspace - failed (increment circuit breaker)
    const db = admin.firestore();
    const workspaceRef = db.collection('workspaces').doc(workspaceId);
    const currentErrors = (workspaceData.consecutiveErrors || 0) + 1;

    const updateData: Record<string, unknown> = {
      lastSyncAt: new Date(),
      lastSyncStatus: 'failed',
      lastError: errorMessage,
      consecutiveErrors: currentErrors,
    };

    // Circuit breaker: disable workspace if too many errors
    if (currentErrors >= MAX_CONSECUTIVE_ERRORS) {
      console.warn(`⚠️ Circuit breaker triggered for workspace ${workspaceId}`, {
        consecutiveErrors: currentErrors,
      });
      updateData.status = 'REQUIRES_ATTENTION';
      updateData.disabledReason = `Too many consecutive sync errors (${currentErrors})`;
    }

    await workspaceRef.update(updateData);

    return {
      success: false,
      domainsProcessed: 0,
      subscriptionsProcessed: 0,
      error: errorMessage,
    };
  }
}

/**
 * Sync All Workspaces (Scheduled Function)
 *
 * Executes daily at 03:00 AM America/Bogota
 * Syncs all active workspaces with circuit breaker protection
 */
export const syncAllWorkspacesScheduled = onSchedule(
  {
    schedule: '0 3 * * *', // Every day at 03:00 AM
    timeZone: 'America/Bogota',
    region: 'us-central1',
  },
  async (event) => {
    console.log('🕐 Starting scheduled sync for all workspaces', {
      timestamp: new Date().toISOString(),
      trigger: 'scheduled',
    });

    const db = admin.firestore();
    const result: SyncAllResult = {
      totalWorkspaces: 0,
      successCount: 0,
      failureCount: 0,
      skippedCount: 0,
      disabledCount: 0,
      details: [],
    };

    try {
      // Get all workspaces with status ACTIVE
      const workspacesSnapshot = await db
        .collection('workspaces')
        .where('status', '==', 'ACTIVE')
        .get();

      result.totalWorkspaces = workspacesSnapshot.size;
      console.log(`Found ${result.totalWorkspaces} active workspaces`);

      // Sync each workspace sequentially (avoid rate limits)
      for (const doc of workspacesSnapshot.docs) {
        const workspaceId = doc.id;
        const workspaceData = doc.data();

        console.log(`\n🔄 Processing workspace: ${workspaceId}`);

        // Check circuit breaker - skip if too many consecutive errors
        const consecutiveErrors = workspaceData.consecutiveErrors || 0;
        if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
          console.warn(`⏭️ Skipping workspace ${workspaceId} (circuit breaker)`, {
            consecutiveErrors,
          });
          result.skippedCount++;
          result.details.push({
            workspaceId,
            status: 'skipped',
            error: `Circuit breaker active (${consecutiveErrors} consecutive errors)`,
          });
          continue;
        }

        // Sync workspace
        const syncResult = await syncSingleWorkspace(workspaceId, workspaceData, 'scheduled');

        if (syncResult.success) {
          result.successCount++;
          result.details.push({
            workspaceId,
            status: 'success',
            domainsProcessed: syncResult.domainsProcessed,
            subscriptionsProcessed: syncResult.subscriptionsProcessed,
          });
        } else {
          result.failureCount++;
          result.details.push({
            workspaceId,
            status: 'failed',
            error: syncResult.error,
          });

          // Check if workspace was disabled by circuit breaker
          const updatedDoc = await doc.ref.get();
          if (updatedDoc.data()?.status === 'REQUIRES_ATTENTION') {
            result.disabledCount++;
          }
        }

        // Rate limiting: wait between workspaces
        if (workspacesSnapshot.docs.indexOf(doc) < workspacesSnapshot.size - 1) {
          console.log(`⏳ Waiting ${RATE_LIMIT_DELAY_MS}ms before next workspace...`);
          await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT_DELAY_MS));
        }
      }

      // Log final summary
      console.log('\n✅ Scheduled sync completed', {
        totalWorkspaces: result.totalWorkspaces,
        successCount: result.successCount,
        failureCount: result.failureCount,
        skippedCount: result.skippedCount,
        disabledCount: result.disabledCount,
      });

      // Store aggregated sync run
      await db.collection('sync_runs').add({
        type: 'batch',
        trigger: 'scheduled',
        startAt: event.scheduleTime,
        endAt: new Date(),
        status: 'completed',
        totalWorkspaces: result.totalWorkspaces,
        successCount: result.successCount,
        failureCount: result.failureCount,
        skippedCount: result.skippedCount,
        disabledCount: result.disabledCount,
      });
    } catch (error: unknown) {
      console.error('❌ Scheduled sync failed', error);

      // Log global failure
      await db.collection('sync_runs').add({
        type: 'batch',
        trigger: 'scheduled',
        startAt: event.scheduleTime,
        endAt: new Date(),
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      throw error;
    }
  }
);

/**
 * Sync All Workspaces (HTTP Endpoint for manual trigger)
 *
 * Allows manual execution of batch sync via HTTP request
 * Useful for testing or on-demand batch synchronization
 */
const httpOptions: HttpsOptions = {
  region: 'us-central1',
  cors: [
    'http://localhost:4200',
    'https://hostinger-workspace-manager.web.app',
    'https://hostinger-workspace-manager.firebaseapp.com',
  ],
};

export const syncAllWorkspaces = onRequest(httpOptions, async (req, res) => {
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

  try {
    // Verify Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    console.log('Authenticated user:', decodedToken.uid);
  } catch (error) {
    console.error('Token verification failed:', error);
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
    return;
  }

  console.log('🔄 Starting manual sync for all workspaces', {
    timestamp: new Date().toISOString(),
    trigger: 'manual',
  });

  const db = admin.firestore();
  const startTime = new Date();
  const result: SyncAllResult = {
    totalWorkspaces: 0,
    successCount: 0,
    failureCount: 0,
    skippedCount: 0,
    disabledCount: 0,
    details: [],
  };

  try {
    // Get all workspaces with status ACTIVE
    const workspacesSnapshot = await db
      .collection('workspaces')
      .where('status', '==', 'ACTIVE')
      .get();

    result.totalWorkspaces = workspacesSnapshot.size;
    console.log(`Found ${result.totalWorkspaces} active workspaces`);

    // Sync each workspace sequentially
    for (const doc of workspacesSnapshot.docs) {
      const workspaceId = doc.id;
      const workspaceData = doc.data();

      console.log(`\n🔄 Processing workspace: ${workspaceId}`);

      // Check circuit breaker
      const consecutiveErrors = workspaceData.consecutiveErrors || 0;
      if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
        console.warn(`⏭️ Skipping workspace ${workspaceId} (circuit breaker)`, {
          consecutiveErrors,
        });
        result.skippedCount++;
        result.details.push({
          workspaceId,
          status: 'skipped',
          error: `Circuit breaker active (${consecutiveErrors} consecutive errors)`,
        });
        continue;
      }

      // Sync workspace
      const syncResult = await syncSingleWorkspace(workspaceId, workspaceData, 'manual');

      if (syncResult.success) {
        result.successCount++;
        result.details.push({
          workspaceId,
          status: 'success',
          domainsProcessed: syncResult.domainsProcessed,
          subscriptionsProcessed: syncResult.subscriptionsProcessed,
        });
      } else {
        result.failureCount++;
        result.details.push({
          workspaceId,
          status: 'failed',
          error: syncResult.error,
        });

        // Check if workspace was disabled
        const updatedDoc = await doc.ref.get();
        if (updatedDoc.data()?.status === 'REQUIRES_ATTENTION') {
          result.disabledCount++;
        }
      }

      // Rate limiting
      if (workspacesSnapshot.docs.indexOf(doc) < workspacesSnapshot.size - 1) {
        console.log(`⏳ Waiting ${RATE_LIMIT_DELAY_MS}ms before next workspace...`);
        await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT_DELAY_MS));
      }
    }

    // Store aggregated sync run
    await db.collection('sync_runs').add({
      type: 'batch',
      trigger: 'manual',
      startAt: startTime,
      endAt: new Date(),
      status: 'completed',
      totalWorkspaces: result.totalWorkspaces,
      successCount: result.successCount,
      failureCount: result.failureCount,
      skippedCount: result.skippedCount,
      disabledCount: result.disabledCount,
    });

    console.log('\n✅ Manual sync completed', result);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Manual sync failed', error);

    // Log global failure
    await db.collection('sync_runs').add({
      type: 'batch',
      trigger: 'manual',
      startAt: startTime,
      endAt: new Date(),
      status: 'failed',
      error: errorMessage,
    });

    res.status(500).json({ error: errorMessage });
  }
});
