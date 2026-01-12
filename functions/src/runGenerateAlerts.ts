import * as functions from 'firebase-functions/v2';
import * as admin from 'firebase-admin';

/**
 * Función HTTP para ejecutar generateAlerts manualmente
 * Solo para pruebas - ejecuta la lógica de generación de alertas
 */
export const runGenerateAlerts = functions.https.onRequest(
  {
    cors: true,
    region: 'us-central1',
  },
  async (req, res) => {
    try {
      functions.logger.info('🧪 Running generateAlerts manually...');

      const db = admin.firestore();

      // Buscar alertas pendientes en log_only
      const alertsSnapshot = await db
        .collection('alertLogs')
        .where('status', '==', 'pending')
        .where('channel', '==', 'email')
        .limit(10)
        .get();

      if (alertsSnapshot.empty) {
        res.status(200).json({
          success: true,
          message: 'No pending email alerts found',
          count: 0,
        });
        return;
      }

      const processedAlerts = [];

      for (const doc of alertsSnapshot.docs) {
        const alert = doc.data();

        functions.logger.info('Processing alert:', { alertId: doc.id, alert });

        // Obtener configuración de email del workspace
        const emailConfigsSnapshot = await db
          .collection('emailConfigs')
          .where('workspaceId', '==', alert.workspaceId)
          .where('enabled', '==', true)
          .limit(1)
          .get();

        if (emailConfigsSnapshot.empty) {
          functions.logger.warn('No email config found for workspace:', alert.workspaceId);
          processedAlerts.push({
            alertId: doc.id,
            status: 'skipped',
            reason: 'No email configuration found',
          });
          continue;
        }

        const emailConfig = emailConfigsSnapshot.docs[0].data();

        // Crear emailLog para enviar
        const emailLog = {
          workspaceId: alert.workspaceId,
          alertId: doc.id,
          recipientEmail: emailConfig.recipientEmail,
          ccEmails: emailConfig.ccEmails || [],
          subject: `⚠️ ${alert.message}`,
          templateType: alert.type,
          status: 'pending' as const,
          retryCount: 0,
          maxRetries: emailConfig.retryPolicy?.maxAttempts || 3,
          createdAt: admin.firestore.Timestamp.now(),
          metadata: {
            ...alert.metadata,
            alertSeverity: alert.severity,
            entityType: alert.type,
          },
        };

        const emailLogRef = await db.collection('emailLogs').add(emailLog);

        functions.logger.info('Email log created:', { emailLogId: emailLogRef.id });

        // Actualizar alerta a procesada
        await doc.ref.update({
          status: 'processed',
          processedAt: admin.firestore.Timestamp.now(),
        });

        processedAlerts.push({
          alertId: doc.id,
          emailLogId: emailLogRef.id,
          status: 'processed',
        });
      }

      functions.logger.info('✅ Alerts processed successfully');

      res.status(200).json({
        success: true,
        message: `Processed ${processedAlerts.length} alerts`,
        count: processedAlerts.length,
        alerts: processedAlerts,
        instructions: 'Check emailLogs collection for email status. Emails will be sent by the sendEmail cloud function or retryFailedEmails scheduled function.',
      });
    } catch (error: unknown) {
      functions.logger.error('❌ Error running generateAlerts:', error);

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({
        success: false,
        error: 'Failed to run generateAlerts',
        details: errorMessage,
      });
    }
  }
);
