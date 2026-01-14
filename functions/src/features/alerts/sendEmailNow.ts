import { onRequest } from 'firebase-functions/v2/https';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import * as cryptoJS from 'crypto-js';
import * as nodemailer from 'nodemailer';

const db = getFirestore();
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'hostinger-workspace-manager-secret-key-2026';

/**
 * Manual Email Sender - HTTP Function
 * Processes pending emailLogs immediately
 */
export const sendEmailNow = onRequest(
  {
    region: 'us-central1',
    cors: true,
  },
  async (req, res) => {
    try {
      console.log('🚀 Starting manual email send...');

      // Query pending emailLogs
      const emailLogsSnapshot = await db
        .collection('emailLogs')
        .where('status', '==', 'pending')
        .limit(10)
        .get();

      if (emailLogsSnapshot.empty) {
        res.json({
          success: true,
          message: 'No pending emails to send',
          count: 0,
        });
        return;
      }

      const results = [];

      for (const doc of emailLogsSnapshot.docs) {
        const emailLog = doc.data();
        const emailLogId = doc.id;

        try {
          console.log(`📧 Processing emailLog ${emailLogId}...`);

          // Get email configuration for workspace
          const configSnapshot = await db
            .collection('emailConfigs')
            .where('workspaceId', '==', emailLog.workspaceId)
            .where('enabled', '==', true)
            .limit(1)
            .get();

          if (configSnapshot.empty) {
            console.log(`⚠️ No email config found for workspace ${emailLog.workspaceId}`);
            results.push({
              emailLogId,
              status: 'skipped',
              reason: 'No email config',
            });
            continue;
          }

          const emailConfig = configSnapshot.docs[0].data();

          console.log(`📋 Email config found:`, {
            workspaceId: emailConfig.workspaceId,
            providerType: emailConfig.providerType,
            hasSmtp: !!emailConfig.provider?.smtp,
            hasPassword: !!emailConfig.provider?.smtp?.password,
          });

          // Decrypt SMTP password
          if (!emailConfig.provider?.smtp?.password) {
            console.error(`❌ No SMTP password found in config`);
            results.push({
              emailLogId,
              status: 'failed',
              reason: 'No SMTP password in config',
            });
            continue;
          }

          const decryptedPassword = cryptoJS.AES.decrypt(
            emailConfig.provider.smtp.password,
            ENCRYPTION_KEY
          ).toString(cryptoJS.enc.Utf8);

          if (!decryptedPassword) {
            console.error(`❌ Failed to decrypt password`);
            results.push({
              emailLogId,
              status: 'failed',
              reason: 'Failed to decrypt password',
            });
            continue;
          }

          console.log(`🔑 Password decrypted successfully (length: ${decryptedPassword.length})`);

          // Create nodemailer transporter
          const transporter = nodemailer.createTransport({
            host: emailConfig.provider.smtp.host,
            port: emailConfig.provider.smtp.port,
            secure: emailConfig.provider.smtp.secure,
            auth: {
              user: emailConfig.provider.smtp.username,
              pass: decryptedPassword,
            },
          });

          // Send email
          const mailOptions: Record<string, unknown> = {
            from: `"${emailConfig.provider.fromName}" <${emailConfig.provider.fromEmail}>`,
            to: emailLog.recipientEmail,
            subject: emailLog.subject,
          };

          // Agregar CC si existen (backward compatibility)
          if (emailLog.ccEmails && emailLog.ccEmails.length > 0) {
            mailOptions.cc = emailLog.ccEmails.join(',');
          }

          // Agregar BCC (copia oculta) si existen
          if (emailLog.bccEmails && emailLog.bccEmails.length > 0) {
            mailOptions.bcc = emailLog.bccEmails.join(',');
          }

          // Usar htmlBody/textBody si existen, sino usar htmlContent/textContent (backward compatibility)
          console.log('📧 Email content check:', {
            hasHtmlBody: !!emailLog.htmlBody,
            hasTextBody: !!emailLog.textBody,
            hasHtmlContent: !!emailLog.htmlContent,
            hasTextContent: !!emailLog.textContent,
            htmlBodyLength: emailLog.htmlBody?.length || 0,
            textBodyLength: emailLog.textBody?.length || 0,
          });

          if (emailLog.htmlBody) {
            mailOptions.html = emailLog.htmlBody;
            mailOptions.text = emailLog.textBody || emailLog.subject; // Fallback a subject si no hay texto
          } else if (emailLog.htmlContent) {
            mailOptions.html = emailLog.htmlContent;
            mailOptions.text = emailLog.textContent || emailLog.subject;
          } else {
            // Si no hay HTML, enviar como texto plano
            mailOptions.text = emailLog.textBody || emailLog.textContent || emailLog.subject;
          }

          const info = await transporter.sendMail(mailOptions);

          console.log(`✅ Email sent successfully: ${info.messageId}`);

          // Update emailLog status
          await doc.ref.update({
            status: 'sent',
            sentAt: Timestamp.now(),
            messageId: info.messageId,
            updatedAt: Timestamp.now(),
          });

          results.push({
            emailLogId,
            status: 'sent',
            messageId: info.messageId,
            recipient: emailLog.recipientEmail,
          });
        } catch (error: unknown) {
          console.error(`❌ Error sending email ${emailLogId}:`, error);

          const errorMessage = error instanceof Error ? error.message : 'Unknown error';

          // Update emailLog with error
          await doc.ref.update({
            status: 'failed',
            error: errorMessage,
            retryCount: (emailLog.retryCount || 0) + 1,
            updatedAt: Timestamp.now(),
          });

          results.push({
            emailLogId,
            status: 'failed',
            error: errorMessage,
          });
        }
      }

      res.json({
        success: true,
        message: `Processed ${results.length} emails`,
        count: results.length,
        results,
      });
    } catch (error: unknown) {
      console.error('Error in sendEmailNow:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({
        success: false,
        error: errorMessage,
      });
    }
  }
);
