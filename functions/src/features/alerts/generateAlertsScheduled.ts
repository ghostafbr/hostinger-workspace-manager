import * as functions from 'firebase-functions/v2';
import * as admin from 'firebase-admin';

const db = admin.firestore();

/**
 * Scheduled function to generate alerts for expiring domains
 * Runs every day at 8:00 AM Colombia time (UTC-5)
 *
 * Implements escalating reminders:
 * - 30 days before expiration (informative)
 * - 15 days before expiration (reminder)
 * - 7 days before expiration (urgent)
 * - 3 days before expiration (critical)
 */
export const generateAlertsScheduled = functions.scheduler.onSchedule(
  {
    schedule: '0 8 * * *', // Every day at 8:00 AM
    timeZone: 'America/Bogota',
    memory: '512MiB',
    timeoutSeconds: 540,
    maxInstances: 1,
  },
  async (event) => {
    functions.logger.info('🕐 Starting scheduled alert generation...');

    try {
      const now = new Date();
      const alertThresholds = [
        { days: 30, type: 'domain_expiring_30', severity: 'info' as const },
        { days: 15, type: 'domain_expiring_15', severity: 'warning' as const },
        { days: 7, type: 'domain_expiring_7', severity: 'urgent' as const },
        { days: 3, type: 'domain_expiring_3', severity: 'critical' as const },
      ];

      let totalAlertsCreated = 0;

      // Process each threshold
      for (const threshold of alertThresholds) {
        const targetDate = new Date();
        targetDate.setDate(now.getDate() + threshold.days);

        // Get domains expiring at this threshold
        const domainsSnapshot = await db
          .collection('domains')
          .where('expiresAt', '<=', targetDate)
          .where('expiresAt', '>', now)
          .get();

        functions.logger.info(`📅 Found ${domainsSnapshot.size} domains for ${threshold.days}-day threshold`);

        for (const domainDoc of domainsSnapshot.docs) {
          const domain = domainDoc.data();
          const daysUntilExpiration = Math.ceil(
            (domain.expiresAt.toDate().getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
          );

          // Only create alert if days match the threshold (±1 day tolerance)
          if (Math.abs(daysUntilExpiration - threshold.days) <= 1) {
            // Check if alert already exists for this domain and threshold
            const existingAlert = await db
              .collection('alerts')
              .where('metadata.entityId', '==', domainDoc.id)
              .where('type', '==', threshold.type)
              .where('status', '==', 'pending')
              .limit(1)
              .get();

            if (existingAlert.empty) {
              // Create new alert
              const alert = {
                workspaceId: domain.workspaceId,
                type: threshold.type,
                severity: threshold.severity,
                message: `Dominio ${domain.domainName} vence en ${threshold.days} días`,
                status: 'pending',
                emailStatus: 'pending',
                metadata: {
                  entityId: domainDoc.id,
                  entityType: 'domain',
                  domainName: domain.domainName,
                  expiresAt: domain.expiresAt,
                  daysUntilExpiration: threshold.days,
                  reminderStage: threshold.days, // Track which reminder this is
                },
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
              };

              await db.collection('alerts').add(alert);
              totalAlertsCreated++;

              functions.logger.info(
                `✅ Created ${threshold.days}-day alert for domain: ${domain.domainName}`
              );
            }
          }
        }
      }

      functions.logger.info(`✅ Alert generation complete. Created ${totalAlertsCreated} new alerts`);

      // Scheduled functions should not return values
    } catch (error: unknown) {
      functions.logger.error('❌ Error in scheduled alert generation:', error);
      throw error;
    }
  }
);
