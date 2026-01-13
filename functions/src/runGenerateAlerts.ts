import * as functions from 'firebase-functions/v2';
import * as admin from 'firebase-admin';
import * as crypto from 'crypto';
import { generateRenewalEmailHTML, generateRenewalEmailText } from './utils/emailTemplates';

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

        // Log para debugging de paymentOptions
        functions.logger.info('📋 Email Config:', {
          hasPaymentOptions: !!emailConfig.paymentOptions,
          paymentOptions: emailConfig.paymentOptions,
        });

        // Obtener información del dominio si la alerta tiene entityId
        let domainData: any = null;
        let recipientEmail = emailConfig.recipientEmail; // Email por defecto (notificaciones)
        let htmlBody = '';
        let textBody = '';

        if (alert.metadata?.entityId && (alert.type === 'domain_expiration' || alert.type === 'domain_expiring')) {
          try {
            functions.logger.info('🔍 Looking for domain:', { entityId: alert.metadata.entityId });

            const domainDoc = await db.collection('domains').doc(alert.metadata.entityId).get();

            functions.logger.info('📄 Domain doc:', {
              exists: domainDoc.exists,
              id: domainDoc.id,
            });

            if (domainDoc.exists) {
              domainData = domainDoc.data();

              // Si el dominio tiene email de contacto, enviamos ahí (email principal)
              // Si no, usamos el recipientEmail de configuración
              if (domainData.contactEmail) {
                recipientEmail = domainData.contactEmail;
              }

              // Calcular días hasta expiración
              const expiresAt = domainData.expiresAt?.toDate();
              const now = new Date();
              const daysUntilExpiration = expiresAt
                ? Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
                : 0;

              const expirationDate = expiresAt
                ? expiresAt.toLocaleDateString('es-CO', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })
                : 'Desconocida';

              // Generar link de pago con Wompi si está configurado
              let paymentLink: string | undefined;
              if (emailConfig.paymentOptions?.wompiPublicKey && domainData.renewalPrice) {
                const amount = domainData.renewalPrice * 100; // Convertir a centavos
                const reference = `${domainData.domainName}-${Date.now()}`;
                const description = `Renovación dominio ${domainData.domainName}`;
                const currency = 'COP';

                // Generar firma de integridad (REQUERIDA por Wompi)
                // La firma se genera con: reference + amount_in_cents + currency + integrity_key
                let signature = '';
                if (emailConfig.paymentOptions.wompiIntegrityKey) {
                  const dataToSign = `${reference}${amount}${currency}${emailConfig.paymentOptions.wompiIntegrityKey}`;
                  signature = crypto.createHash('sha256').update(dataToSign).digest('hex');
                }

                const params = new URLSearchParams({
                  'public-key': emailConfig.paymentOptions.wompiPublicKey,
                  'currency': currency,
                  'amount-in-cents': amount.toString(),
                  'reference': reference,
                  'description': description,
                  ...(signature && { 'signature:integrity': signature }),
                  ...(recipientEmail && { 'customer-email': recipientEmail }),
                });

                paymentLink = `https://checkout.wompi.co/p/?${params.toString()}`;
              }

              // Generar HTML y texto del email
              const templateData = {
                domainName: domainData.domainName,
                expirationDate,
                daysUntilExpiration,
                renewalPrice: domainData.renewalPrice ||
                              (domainData.hostingRenewalPrice || 0) + (domainData.domainRenewalPrice || 0) ||
                              50000, // Precio por defecto si no está configurado
                hostingRenewalPrice: domainData.hostingRenewalPrice,
                domainRenewalPrice: domainData.domainRenewalPrice,
                paymentLink,
                bancolombia: emailConfig.paymentOptions?.bancolombia,
                nequi: emailConfig.paymentOptions?.nequi,
              };

              functions.logger.info('📝 Template Data:', {
                ...templateData,
                hasBancolombia: !!templateData.bancolombia,
                hasNequi: !!templateData.nequi,
                hasPaymentLink: !!templateData.paymentLink,
              });

              htmlBody = generateRenewalEmailHTML(templateData);
              textBody = generateRenewalEmailText(templateData);

              functions.logger.info('✅ Generated email template for domain:', {
                domainName: domainData.domainName,
                recipientEmail,
                hasPaymentLink: !!paymentLink,
              });
            }
          } catch (error) {
            functions.logger.error('Error fetching domain data:', error);
          }
        }

        // Crear emailLog para enviar
        const emailLog: any = {
          workspaceId: alert.workspaceId,
          alertId: doc.id,
          recipientEmail,
          // Agregar email de notificaciones como BCC (copia oculta) si es diferente al destinatario principal
          bccEmails: recipientEmail !== emailConfig.recipientEmail
            ? [emailConfig.recipientEmail, ...(emailConfig.ccEmails || [])]
            : (emailConfig.ccEmails || []),
          subject: domainData
            ? `Renovación de dominio: ${domainData.domainName} vence pronto`
            : `⚠️ ${alert.message}`,
          templateType: alert.type,
          status: 'pending' as const,
          retryCount: 0,
          maxRetries: emailConfig.retry?.maxAttempts || 3,
          createdAt: admin.firestore.Timestamp.now(),
          metadata: {
            ...alert.metadata,
            alertSeverity: alert.severity,
            entityType: alert.type,
            ...(domainData?.domainName ? { domainName: domainData.domainName } : {}),
          },
        };

        // Agregar HTML/texto si se generó
        if (htmlBody) {
          emailLog.htmlBody = htmlBody;
          emailLog.textBody = textBody;
        }

        const emailLogRef = await db.collection('emailLogs').add(emailLog);

        functions.logger.info('📧 Email log created:', {
          emailLogId: emailLogRef.id,
          recipient: recipientEmail,
          bcc: emailLog.bccEmails,
        });

        // Actualizar alerta a procesada
        await doc.ref.update({
          status: 'processed',
          processedAt: admin.firestore.Timestamp.now(),
        });

        processedAlerts.push({
          alertId: doc.id,
          emailLogId: emailLogRef.id,
          status: 'processed',
          recipient: recipientEmail,
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
