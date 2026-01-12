/**
 * Cloud Function: Calculate Health Metrics
 *
 * Scheduled function that runs every 15 minutes to:
 * - Calculate health metrics for all workspaces
 * - Save metrics history to Firestore
 * - Detect and create proactive health alerts
 * - Send webhook notifications for critical issues
 */

import * as admin from 'firebase-admin';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import * as https from 'https';
import * as http from 'http';

interface SyncRun {
  workspaceId: string;
  status: string;
  startedAt: admin.firestore.Timestamp;
  duration?: number;
  errorMessage?: string;
}

interface RateLimitData {
  workspaceId: string;
  requests: number;
  remaining: number;
  limit: number;
  percentage: number;
  resetTime: admin.firestore.Timestamp;
  lastUpdated: admin.firestore.Timestamp;
}

interface HealthMetrics {
  workspaceId: string;
  workspaceName: string;
  healthScore: number;
  healthStatus: 'healthy' | 'warning' | 'critical';
  rateLimitPercentage: number;
  rateLimitRemaining: number;
  consecutiveFailures: number;
  totalSyncs: number;
  successfulSyncs: number;
  failedSyncs: number;
  averageSyncTime: number;
  lastSuccessfulSync: Date | null;
  lastFailedSync: Date | null;
  errorFrequency: number;
  circuitBreakerStatus: 'closed' | 'open' | 'half-open';
  lastUpdated: admin.firestore.Timestamp;
}

/**
 * Calculate health score based on metrics (0-100)
 */
function calculateHealthScore(metrics: {
  rateLimitPercentage: number;
  consecutiveFailures: number;
  errorFrequency: number;
  circuitBreakerStatus: string;
}): number {
  let score = 100;

  // Rate limit impact (max -30 points)
  if (metrics.rateLimitPercentage >= 90) score -= 30;
  else if (metrics.rateLimitPercentage >= 80) score -= 20;
  else if (metrics.rateLimitPercentage >= 70) score -= 10;

  // Consecutive failures impact (max -30 points)
  score -= Math.min(metrics.consecutiveFailures * 10, 30);

  // Error frequency impact (max -20 points)
  score -= Math.min(metrics.errorFrequency * 2, 20);

  // Circuit breaker impact (-20 points if open)
  if (metrics.circuitBreakerStatus === 'open') score -= 20;

  return Math.max(0, score);
}

/**
 * Determine health status from score
 */
function getHealthStatus(score: number): 'healthy' | 'warning' | 'critical' {
  if (score >= 80) return 'healthy';
  if (score >= 50) return 'warning';
  return 'critical';
}

/**
 * Calculate metrics for a workspace
 */
async function calculateWorkspaceMetrics(
  workspaceId: string,
  workspaceName: string
): Promise<HealthMetrics> {
  const db = admin.firestore();

  // Get sync runs (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const syncRunsSnapshot = await db
    .collection('syncRuns')
    .where('workspaceId', '==', workspaceId)
    .where('startedAt', '>=', admin.firestore.Timestamp.fromDate(thirtyDaysAgo))
    .orderBy('startedAt', 'desc')
    .get();

  const syncRuns = syncRunsSnapshot.docs.map((doc) => doc.data() as SyncRun);

  const totalSyncs = syncRuns.length;
  const successfulSyncs = syncRuns.filter((run) => run.status === 'success').length;
  const failedSyncs = totalSyncs - successfulSyncs;

  // Calculate consecutive failures
  let consecutiveFailures = 0;
  for (const run of syncRuns) {
    if (run.status === 'failed') consecutiveFailures++;
    else break;
  }

  // Calculate average sync time
  const completedSyncs = syncRuns.filter((run) => run.status === 'success' && run.duration);
  const averageSyncTime =
    completedSyncs.length > 0
      ? completedSyncs.reduce((sum, run) => sum + (run.duration || 0), 0) / completedSyncs.length
      : 0;

  // Get last successful/failed sync
  const lastSuccessfulSync = syncRuns.find((run) => run.status === 'success');
  const lastFailedSync = syncRuns.find((run) => run.status === 'failed');

  // Calculate error frequency (last 24h)
  const oneDayAgo = new Date();
  oneDayAgo.setHours(oneDayAgo.getHours() - 24);

  const recentErrors = syncRuns.filter((run) => {
    const startedAt = run.startedAt.toDate();
    return startedAt >= oneDayAgo && run.status === 'failed' && run.errorMessage;
  });
  const errorFrequency = recentErrors.length;

  // Get rate limit data
  const rateLimitDoc = await db.collection('rateLimits').doc(workspaceId).get();
  const rateLimitData = rateLimitDoc.exists ? (rateLimitDoc.data() as RateLimitData) : null;

  const rateLimitPercentage = rateLimitData?.percentage || 0;
  const rateLimitRemaining = rateLimitData?.remaining || 1000;

  // Determine circuit breaker status
  const circuitBreakerStatus: 'closed' | 'open' | 'half-open' =
    consecutiveFailures >= 5 ? 'open' : 'closed';

  // Calculate health score
  const healthScore = calculateHealthScore({
    rateLimitPercentage,
    consecutiveFailures,
    errorFrequency,
    circuitBreakerStatus,
  });

  const healthStatus = getHealthStatus(healthScore);

  return {
    workspaceId,
    workspaceName,
    healthScore,
    healthStatus,
    rateLimitPercentage,
    rateLimitRemaining,
    consecutiveFailures,
    totalSyncs,
    successfulSyncs,
    failedSyncs,
    averageSyncTime,
    lastSuccessfulSync: lastSuccessfulSync ? lastSuccessfulSync.startedAt.toDate() : null,
    lastFailedSync: lastFailedSync ? lastFailedSync.startedAt.toDate() : null,
    errorFrequency,
    circuitBreakerStatus,
    lastUpdated: admin.firestore.Timestamp.now(),
  };
}

/**
 * Save health metrics to Firestore
 */
async function saveHealthMetrics(metrics: HealthMetrics): Promise<void> {
  const db = admin.firestore();

  // Save current metrics (overwrites previous)
  await db.collection('healthMetrics').doc(metrics.workspaceId).set(metrics);

  // Save to history
  await db.collection('healthHistory').add({
    timestamp: metrics.lastUpdated,
    workspaceId: metrics.workspaceId,
    workspaceName: metrics.workspaceName,
    healthScore: metrics.healthScore,
    rateLimitUsage: metrics.rateLimitPercentage,
    syncSuccessRate:
      metrics.totalSyncs > 0
        ? Math.round((metrics.successfulSyncs / metrics.totalSyncs) * 100)
        : 100,
    errorCount: metrics.errorFrequency,
    consecutiveFailures: metrics.consecutiveFailures,
  });
}

/**
 * Create health alert if needed
 */
async function createHealthAlertIfNeeded(metrics: HealthMetrics): Promise<void> {
  const db = admin.firestore();

  const alerts: { severity: 'warning' | 'critical'; title: string; message: string }[] = [];

  // Critical rate limit
  if (metrics.rateLimitPercentage >= 90) {
    alerts.push({
      severity: 'critical',
      title: 'Rate Limit Critical',
      message: `Rate limit at ${metrics.rateLimitPercentage}%. Immediate action required.`,
    });
  }
  // Near rate limit
  else if (metrics.rateLimitPercentage >= 80) {
    alerts.push({
      severity: 'warning',
      title: 'Rate Limit Warning',
      message: `Rate limit at ${metrics.rateLimitPercentage}%. Consider reducing API calls.`,
    });
  }

  // Consecutive failures
  if (metrics.consecutiveFailures >= 3) {
    alerts.push({
      severity: 'critical',
      title: 'Sync Failures Detected',
      message: `${metrics.consecutiveFailures} consecutive failures. Check configuration.`,
    });
  }

  // Circuit breaker open
  if (metrics.circuitBreakerStatus === 'open') {
    alerts.push({
      severity: 'critical',
      title: 'Circuit Breaker Open',
      message: 'Circuit breaker triggered. Workspace syncs paused.',
    });
  }

  // Critical health score
  if (metrics.healthScore < 50) {
    alerts.push({
      severity: 'critical',
      title: 'Critical Health Status',
      message: `Health score is ${metrics.healthScore}/100. Multiple issues detected.`,
    });
  }

  // Save alerts (check for duplicates)
  for (const alert of alerts) {
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);

    const duplicateQuery = await db
      .collection('healthAlerts')
      .where('workspaceId', '==', metrics.workspaceId)
      .where('title', '==', alert.title)
      .where('createdAt', '>=', admin.firestore.Timestamp.fromDate(oneHourAgo))
      .limit(1)
      .get();

    if (duplicateQuery.empty) {
      await db.collection('healthAlerts').add({
        workspaceId: metrics.workspaceId,
        workspaceName: metrics.workspaceName,
        severity: alert.severity,
        title: alert.title,
        message: alert.message,
        isRead: false,
        createdAt: admin.firestore.Timestamp.now(),
      });
      console.log(`Alert created: ${alert.title} for ${metrics.workspaceName}`);

      // Send webhook notification if configured
      await sendWebhookNotification(metrics, alert);
    }
  }
}

/**
 * Send webhook notification for alert
 */
async function sendWebhookNotification(
  metrics: HealthMetrics,
  alert: { severity: 'warning' | 'critical'; title: string; message: string }
): Promise<void> {
  const db = admin.firestore();

  try {
    // Get workspace to check webhook configuration
    const workspaceDoc = await db.collection('workspaces').doc(metrics.workspaceId).get();
    const workspaceData = workspaceDoc.data();

    if (!workspaceData?.webhookConfig?.enabled) {
      console.log(`Webhook not configured for workspace: ${metrics.workspaceName}`);
      return;
    }

    const webhookConfig = workspaceData.webhookConfig;

    // Map alert to webhook event
    const event = mapAlertToWebhookEvent(alert.title, alert.severity);

    // Check if event is enabled
    if (!webhookConfig.events?.includes(event)) {
      console.log(`Event ${event} not configured for webhook`);
      return;
    }

    // Check severity threshold
    if (webhookConfig.minSeverity === 'critical' && alert.severity === 'warning') {
      console.log(`Alert severity below threshold, skipping webhook`);
      return;
    }

    // Build webhook payload
    const payload = {
      event,
      severity: alert.severity,
      title: alert.title,
      message: alert.message,
      workspace: {
        id: metrics.workspaceId,
        name: metrics.workspaceName,
      },
      timestamp: new Date().toISOString(),
      metadata: {
        healthScore: metrics.healthScore,
        rateLimitPercentage: metrics.rateLimitPercentage,
        consecutiveFailures: metrics.consecutiveFailures,
      },
    };

    // Format payload for platform
    const formattedPayload = formatPayloadForPlatform(webhookConfig.platform, payload);

    // Send webhook
    await sendHttpWebhook(webhookConfig.url, formattedPayload, webhookConfig.headers);

    console.log(`Webhook sent successfully for ${metrics.workspaceName}: ${alert.title}`);
  } catch (error) {
    console.error(`Failed to send webhook for ${metrics.workspaceName}:`, error);
    // Don't throw - webhook failures shouldn't break the main flow
  }
}

/**
 * Map alert to webhook event type
 */
function mapAlertToWebhookEvent(
  title: string,
  severity: 'warning' | 'critical'
): string {
  if (title.includes('Rate Limit Critical')) return 'rateLimit.critical';
  if (title.includes('Rate Limit Warning')) return 'rateLimit.warning';
  if (title.includes('Consecutive Failures') || title.includes('Sync Failures')) {
    return 'sync.consecutiveFailures';
  }
  if (title.includes('Circuit Breaker')) return 'circuitBreaker.open';
  if (title.includes('Sync Failed')) return 'sync.failure';
  if (severity === 'critical') return 'health.critical';
  return 'health.warning';
}

/**
 * Format payload for specific platform
 */
function formatPayloadForPlatform(
  platform: string,
  payload: {
    event: string;
    severity: string;
    title: string;
    message: string;
    workspace: { id: string; name: string };
    timestamp: string;
    metadata: {
      healthScore: number;
      rateLimitPercentage: number;
      consecutiveFailures: number;
    };
  }
): unknown {
  switch (platform) {
    case 'slack':
      return formatSlackPayload(payload);
    case 'discord':
      return formatDiscordPayload(payload);
    case 'teams':
      return formatTeamsPayload(payload);
    default:
      return payload; // Custom webhook - send raw payload
  }
}

/**
 * Format payload for Slack
 */
function formatSlackPayload(payload: {
  severity: string;
  title: string;
  message: string;
  workspace: { name: string };
  timestamp: string;
  metadata: {
    healthScore: number;
    rateLimitPercentage: number;
    consecutiveFailures: number;
  };
}): unknown {
  const color = payload.severity === 'critical' ? 'danger' : 'warning';
  const emoji = payload.severity === 'critical' ? ':rotating_light:' : ':warning:';

  return {
    text: `${emoji} ${payload.title}`,
    attachments: [
      {
        color,
        title: payload.title,
        text: payload.message,
        fields: [
          { title: 'Workspace', value: payload.workspace.name, short: true },
          { title: 'Severity', value: payload.severity.toUpperCase(), short: true },
          { title: 'Health Score', value: `${payload.metadata.healthScore}/100`, short: true },
          {
            title: 'Rate Limit',
            value: `${payload.metadata.rateLimitPercentage}%`,
            short: true,
          },
        ],
        footer: 'Hostinger Workspace Manager',
        ts: Math.floor(new Date(payload.timestamp).getTime() / 1000),
      },
    ],
  };
}

/**
 * Format payload for Discord
 */
function formatDiscordPayload(payload: {
  severity: string;
  title: string;
  message: string;
  workspace: { name: string };
  timestamp: string;
  metadata: {
    healthScore: number;
    rateLimitPercentage: number;
    consecutiveFailures: number;
  };
}): unknown {
  const color = payload.severity === 'critical' ? 0xff0000 : 0xffa500;

  return {
    embeds: [
      {
        title: payload.title,
        description: payload.message,
        color,
        fields: [
          { name: 'Workspace', value: payload.workspace.name, inline: true },
          { name: 'Severity', value: payload.severity.toUpperCase(), inline: true },
          { name: 'Health Score', value: `${payload.metadata.healthScore}/100`, inline: true },
          {
            name: 'Rate Limit',
            value: `${payload.metadata.rateLimitPercentage}%`,
            inline: true,
          },
        ],
        footer: { text: 'Hostinger Workspace Manager' },
        timestamp: payload.timestamp,
      },
    ],
  };
}

/**
 * Format payload for Microsoft Teams
 */
function formatTeamsPayload(payload: {
  severity: string;
  title: string;
  message: string;
  workspace: { name: string };
  metadata: {
    healthScore: number;
    rateLimitPercentage: number;
  };
}): unknown {
  const themeColor = payload.severity === 'critical' ? 'FF0000' : 'FFA500';

  return {
    '@type': 'MessageCard',
    '@context': 'https://schema.org/extensions',
    themeColor,
    summary: payload.title,
    sections: [
      {
        activityTitle: payload.title,
        activitySubtitle: payload.message,
        facts: [
          { name: 'Workspace', value: payload.workspace.name },
          { name: 'Severity', value: payload.severity.toUpperCase() },
          { name: 'Health Score', value: `${payload.metadata.healthScore}/100` },
          { name: 'Rate Limit', value: `${payload.metadata.rateLimitPercentage}%` },
        ],
      },
    ],
  };
}

/**
 * Send HTTP webhook request
 */
function sendHttpWebhook(
  url: string,
  payload: unknown,
  customHeaders?: Record<string, string>
): Promise<void> {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    const urlObj = new URL(url);

    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        ...customHeaders,
      },
    };

    const client = urlObj.protocol === 'https:' ? https : http;

    const req = client.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          resolve();
        } else {
          reject(
            new Error(
              `Webhook failed with status ${res.statusCode}: ${responseData}`
            )
          );
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

/**
 * Main scheduled function - runs every 15 minutes
 */
export const calculateHealthMetrics = onSchedule(
  {
    schedule: 'every 15 minutes',
    timeZone: 'America/Bogota',
    memory: '256MiB',
  },
  async (_event) => {
    console.log('Starting health metrics calculation...');

    const db = admin.firestore();
    const workspacesSnapshot = await db.collection('workspaces').get();

    let processedCount = 0;
    let errorCount = 0;

    for (const workspaceDoc of workspacesSnapshot.docs) {
      try {
        const workspaceData = workspaceDoc.data();
        const workspaceId = workspaceDoc.id;
        const workspaceName = workspaceData.name || 'Unknown';

        console.log(`Calculating metrics for: ${workspaceName}`);

        const metrics = await calculateWorkspaceMetrics(workspaceId, workspaceName);
        await saveHealthMetrics(metrics);
        await createHealthAlertIfNeeded(metrics);

        processedCount++;
      } catch (error) {
        console.error(`Error processing workspace ${workspaceDoc.id}:`, error);
        errorCount++;
      }
    }

    console.log(`Health metrics calculation completed. Processed: ${processedCount}, Errors: ${errorCount}`);
  }
);
