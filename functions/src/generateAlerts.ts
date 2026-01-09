import {onSchedule} from 'firebase-functions/v2/scheduler';
import {initializeApp} from 'firebase-admin/app';
import {getFirestore, Timestamp} from 'firebase-admin/firestore';

// Initialize Firebase Admin (if not already initialized)
try {
  initializeApp();
} catch (error) {
  // App already initialized
}

const db = getFirestore();

/**
 * Entity Type Enum (must match Angular enum)
 */
enum EntityType {
  DOMAIN = 'domain',
  SUBSCRIPTION = 'subscription',
}

/**
 * Alert Channel Enum (must match Angular enum)
 */
enum AlertChannel {
  EMAIL = 'email',
  LOG_ONLY = 'log_only',
}

/**
 * Audit Status Enum (must match Angular enum)
 */
enum AuditStatus {
  SUCCESS = 'success',
  FAILURE = 'failure',
  PARTIAL = 'partial',
}

/**
 * Audit Action Enum (must match Angular enum)
 */
enum AuditAction {
  GENERATE_ALERTS = 'generate_alerts',
}

interface AlertRule {
  id: string;
  workspaceId?: string;
  entityType: EntityType;
  daysBefore: number[];
  channel: AlertChannel;
  enabled: boolean;
}

interface Entity {
  id: string;
  workspaceId: string;
  name?: string;
  domain?: string;
  productName?: string;
  expiresAt: Timestamp;
}

/**
 * Generate Alerts - Scheduled Cloud Function
 *
 * Runs daily at 03:00 AM (US Central Time)
 * Calculates days to expiration and creates alert logs
 */
export const generateAlerts = onSchedule(
  {
    schedule: 'every day 03:00',
    timeZone: 'America/Chicago',
    region: 'us-central1',
    timeoutSeconds: 540,
    memory: '512MiB',
  },
  async (event) => {
    const startTime = Date.now();
    console.log('🔔 Starting generateAlerts job...');

    let totalAlertsGenerated = 0;
    let totalWorkspacesProcessed = 0;
    let totalErrors = 0;

    try {
      // Get all active workspaces
      const workspacesSnapshot = await db
        .collection('workspaces')
        .where('disabled', '==', false)
        .get();

      console.log(`Found ${workspacesSnapshot.size} active workspaces`);

      for (const workspaceDoc of workspacesSnapshot.docs) {
        const workspaceId = workspaceDoc.id;

        try {
          // Get or create default alert rules for this workspace
          const rules = await getAlertRules(workspaceId);

          // Process domains
          const domainAlertsCount = await processEntities(
            workspaceId,
            EntityType.DOMAIN,
            rules.filter((r) => r.entityType === EntityType.DOMAIN)
          );

          // Process subscriptions
          const subscriptionAlertsCount = await processEntities(
            workspaceId,
            EntityType.SUBSCRIPTION,
            rules.filter((r) => r.entityType === EntityType.SUBSCRIPTION)
          );

          totalAlertsGenerated += domainAlertsCount + subscriptionAlertsCount;
          totalWorkspacesProcessed++;

          console.log(
            `✅ Workspace ${workspaceId}: ${domainAlertsCount} domain alerts, ${subscriptionAlertsCount} subscription alerts`
          );
        } catch (error) {
          totalErrors++;
          console.error(`❌ Error processing workspace ${workspaceId}:`, error);

          // Log workspace error to audit_logs
          await createAuditLog({
            workspaceId,
            action: AuditAction.GENERATE_ALERTS,
            status: AuditStatus.FAILURE,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }

      const duration = Date.now() - startTime;

      // Log successful execution to audit_logs
      await createAuditLog({
        workspaceId: null, // Global audit log
        action: AuditAction.GENERATE_ALERTS,
        status: totalErrors === 0 ? AuditStatus.SUCCESS : AuditStatus.PARTIAL,
        metadata: {
          totalWorkspaces: workspacesSnapshot.size,
          workspacesProcessed: totalWorkspacesProcessed,
          alertsGenerated: totalAlertsGenerated,
          errors: totalErrors,
          durationMs: duration,
        },
      });

      console.log('✅ generateAlerts job completed successfully');
      console.log(`   - Workspaces processed: ${totalWorkspacesProcessed}`);
      console.log(`   - Alerts generated: ${totalAlertsGenerated}`);
      console.log(`   - Errors: ${totalErrors}`);
      console.log(`   - Duration: ${duration}ms`);
    } catch (error) {
      console.error('❌ Fatal error in generateAlerts:', error);

      // Log fatal error
      await createAuditLog({
        workspaceId: null,
        action: AuditAction.GENERATE_ALERTS,
        status: AuditStatus.FAILURE,
        error: error instanceof Error ? error.message : 'Fatal error',
      });

      throw error;
    }
  }
);

/**
 * Get alert rules for a workspace (or create defaults)
 */
async function getAlertRules(workspaceId: string): Promise<AlertRule[]> {
  const rulesSnapshot = await db
    .collection('alert_rules')
    .where('workspaceId', '==', workspaceId)
    .where('enabled', '==', true)
    .get();

  if (!rulesSnapshot.empty) {
    return rulesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as AlertRule[];
  }

  // No rules found - create and return defaults
  const defaultRules: Omit<AlertRule, 'id'>[] = [
    {
      workspaceId,
      entityType: EntityType.DOMAIN,
      daysBefore: [45, 30, 15, 7, 3, 1],
      channel: AlertChannel.LOG_ONLY,
      enabled: true,
    },
    {
      workspaceId,
      entityType: EntityType.SUBSCRIPTION,
      daysBefore: [45, 30, 15, 7, 3, 1],
      channel: AlertChannel.LOG_ONLY,
      enabled: true,
    },
  ];

  // Create default rules in Firestore
  for (const rule of defaultRules) {
    await db.collection('alert_rules').add(rule);
  }

  console.log(`Created default alert rules for workspace ${workspaceId}`);

  return defaultRules.map((rule, index) => ({
    id: `default_${workspaceId}_${index}`,
    ...rule,
  }));
}

/**
 * Process entities (domains or subscriptions) and generate alerts
 */
async function processEntities(
  workspaceId: string,
  entityType: EntityType,
  rules: AlertRule[]
): Promise<number> {
  if (rules.length === 0) {
    return 0; // No rules, skip processing
  }

  const collectionName = entityType === EntityType.DOMAIN ? 'domains' : 'subscriptions';
  const now = Timestamp.now();
  const maxDaysBefore = Math.max(...rules.flatMap((r) => r.daysBefore));
  const maxDate = Timestamp.fromDate(
    new Date(now.toDate().getTime() + maxDaysBefore * 24 * 60 * 60 * 1000)
  );

  // Get entities expiring within max threshold
  const entitiesSnapshot = await db
    .collection(collectionName)
    .where('workspaceId', '==', workspaceId)
    .where('expiresAt', '>', now)
    .where('expiresAt', '<=', maxDate)
    .get();

  let alertsGenerated = 0;

  for (const entityDoc of entitiesSnapshot.docs) {
    const entity = {id: entityDoc.id, ...entityDoc.data()} as Entity;
    const daysToExpire = Math.ceil(
      (entity.expiresAt.toDate().getTime() - now.toDate().getTime()) /
        (24 * 60 * 60 * 1000)
    );

    // Check each rule to see if should trigger alert
    for (const rule of rules) {
      if (rule.daysBefore.includes(daysToExpire)) {
        // Check deduplication: has this alert been generated before?
        const exists = await alertExists(
          workspaceId,
          entity.id,
          entityType,
          daysToExpire
        );

        if (!exists) {
          // Create alert log
          await db.collection('alert_logs').add({
            workspaceId,
            entityType,
            entityId: entity.id,
            entityName:
              entity.name || entity.domain || entity.productName || entity.id,
            daysBefore: daysToExpire,
            expiresAt: entity.expiresAt,
            createdAt: Timestamp.now(),
            processed: false,
          });

          alertsGenerated++;
        }
      }
    }
  }

  return alertsGenerated;
}

/**
 * Check if alert already exists (deduplication)
 */
async function alertExists(
  workspaceId: string,
  entityId: string,
  entityType: EntityType,
  daysBefore: number
): Promise<boolean> {
  const snapshot = await db
    .collection('alert_logs')
    .where('workspaceId', '==', workspaceId)
    .where('entityId', '==', entityId)
    .where('entityType', '==', entityType)
    .where('daysBefore', '==', daysBefore)
    .limit(1)
    .get();

  return !snapshot.empty;
}

/**
 * Create audit log entry
 */
async function createAuditLog(data: {
  workspaceId: string | null;
  action: AuditAction;
  status: AuditStatus;
  error?: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  try {
    await db.collection('audit_logs').add({
      workspaceId: data.workspaceId || 'system',
      userId: 'system',
      action: data.action,
      status: data.status,
      error: data.error || null,
      metadata: data.metadata || {},
      createdAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
  }
}
