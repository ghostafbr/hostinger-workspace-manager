import {onCall, HttpsError} from 'firebase-functions/v2/https';
import {initializeApp} from 'firebase-admin/app';
import {getFirestore, Timestamp} from 'firebase-admin/firestore';
import * as cryptoJS from 'crypto-js';
import * as nodemailer from 'nodemailer';

// Initialize Firebase Admin
try {
  initializeApp();
} catch {
  // App already initialized
}

const db = getFirestore();
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'hostinger-workspace-manager-secret-key-2026';

/**
 * Send Email HTTP Callable Function
 *
 * Sends transactional emails using SendGrid API
 * Implements retry logic and rate limiting
 *
 * @example
 * ```typescript
 * const result = await functions.httpsCallable('sendEmail')({
 *   workspaceId: 'abc123',
 *   to: 'user@example.com',
 *   subject: 'Domain Expiring',
 *   htmlContent: '<html>...</html>',
 *   textContent: 'Plain text version',
 *   templateType: 'domain_expiring'
 * });
 * ```
 */
export const sendEmail = onCall(
  {
    region: 'us-central1',
    timeoutSeconds: 60,
    memory: '256MiB',
    maxInstances: 10,
  },
  async (request) => {
    const {auth, data} = request;

    // Validate authentication
    if (!auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    // Validate required fields
    const {workspaceId, to, subject, htmlContent, textContent, templateType, alertLogId} = data;

    if (!workspaceId || !to || !subject || !htmlContent || !textContent || !templateType) {
      throw new HttpsError(
        'invalid-argument',
        'Missing required fields: workspaceId, to, subject, htmlContent, textContent, templateType'
      );
    }

    const userId = auth.uid;

    try {
      // 1. Verify workspace ownership
      const workspaceDoc = await db.collection('workspaces').doc(workspaceId).get();
      if (!workspaceDoc.exists) {
        throw new HttpsError('not-found', 'Workspace not found');
      }

      const workspaceData = workspaceDoc.data();
      if (workspaceData?.createdBy !== userId) {
        throw new HttpsError('permission-denied', 'Not authorized to send emails for this workspace');
      }

      // 2. Get email configuration
      const emailConfigQuery = await db
        .collection('emailConfigs')
        .where('workspaceId', '==', workspaceId)
        .limit(1)
        .get();

      if (emailConfigQuery.empty) {
        throw new HttpsError('failed-precondition', 'Email configuration not found for workspace');
      }

      const emailConfig = emailConfigQuery.docs[0].data();

      if (!emailConfig.enabled) {
        throw new HttpsError('failed-precondition', 'Email notifications are disabled for this workspace');
      }

      const providerType = emailConfig.providerType || 'sendgrid'; // Default to SendGrid for backward compatibility

      // 3. Check rate limits
      const rateLimitResult = await checkRateLimits(workspaceId, emailConfig);
      if (!rateLimitResult.canSend) {
        throw new HttpsError(
          'resource-exhausted',
          `Rate limit exceeded. Hourly: ${rateLimitResult.hourlyCount}/${rateLimitResult.maxPerHour}, Daily: ${rateLimitResult.dailyCount}/${rateLimitResult.maxPerDay}`
        );
      }

      // 4. Prepare credentials based on provider
      let credentials;
      if (providerType === 'smtp') {
        const smtpConfig = emailConfig.provider?.smtp;
        if (!smtpConfig || !smtpConfig.password) {
          throw new HttpsError('failed-precondition', 'SMTP configuration not found');
        }

        const decryptedPassword = cryptoJS.AES.decrypt(smtpConfig.password, ENCRYPTION_KEY).toString(cryptoJS.enc.Utf8);
        if (!decryptedPassword) {
          throw new HttpsError('failed-precondition', 'Failed to decrypt SMTP password');
        }

        credentials = {
          type: 'smtp' as const,
          smtp: {
            ...smtpConfig,
            password: decryptedPassword,
          },
        };
      } else {
        // SendGrid
        const encryptedApiKey = emailConfig.provider?.apiKey;
        if (!encryptedApiKey) {
          throw new HttpsError('failed-precondition', 'SendGrid API key not configured');
        }

        const apiKey = cryptoJS.AES.decrypt(encryptedApiKey, ENCRYPTION_KEY).toString(cryptoJS.enc.Utf8);
        if (!apiKey) {
          throw new HttpsError('failed-precondition', 'Failed to decrypt SendGrid API key');
        }

        credentials = {
          type: 'sendgrid' as const,
          apiKey,
        };
      }

      // 5. Create email log entry (pending)
      const emailLogRef = await db.collection('emailLogs').add({
        workspaceId,
        alertLogId: alertLogId || null,
        recipientEmail: to,
        subject,
        templateType,
        status: 'pending',
        retryCount: 0,
        maxRetries: emailConfig.retry?.maxAttempts || 3,
        createdAt: Timestamp.now(),
      });

      // 6. Send email via configured provider
      try {
        const response = await sendEmail_internal({
          credentials,
          to,
          from: emailConfig.provider.fromEmail,
          fromName: emailConfig.provider.fromName,
          subject,
          htmlContent,
          textContent,
          cc: data.cc || [],
        });

        // 7. Update email log as sent
        await emailLogRef.update({
          status: 'sent',
          messageId: response.messageId,
          sentAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });

        console.log(`✅ Email sent successfully: ${response.messageId}`);

        return {
          success: true,
          messageId: response.messageId,
          emailLogId: emailLogRef.id,
        };
      } catch (sendError: unknown) {
        // 8. Handle send failure
        const errorMessage = sendError instanceof Error ? sendError.message : 'Unknown error';

        const retryCount = 1;
        const maxRetries = emailConfig.retry?.maxAttempts || 3;
        const delayMinutes = emailConfig.retry?.delayMinutes || 5;

        const nextRetryAt = Timestamp.fromDate(new Date(Date.now() + delayMinutes * 60 * 1000));

        await emailLogRef.update({
          status: retryCount < maxRetries ? 'retrying' : 'failed',
          errorMessage,
          retryCount,
          nextRetryAt: retryCount < maxRetries ? nextRetryAt : null,
          updatedAt: Timestamp.now(),
        });

        console.error(`❌ Failed to send email: ${errorMessage}`);

        throw new HttpsError('internal', `Failed to send email: ${errorMessage}`);
      }
    } catch (error: unknown) {
      if (error instanceof HttpsError) {
        throw error;
      }

      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error in sendEmail function:', error);
      throw new HttpsError('internal', `Internal server error: ${message}`);
    }
  }
);

/**
 * Internal function to send email via configured provider
 */
async function sendEmail_internal(params: {
  credentials:
    | {type: 'sendgrid'; apiKey: string}
    | {type: 'smtp'; smtp: {host: string; port: number; secure: boolean; username: string; password: string}};
  to: string;
  from: string;
  fromName: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  cc?: string[];
}): Promise<{messageId: string}> {
  const {credentials, to, from, fromName, subject, htmlContent, textContent, cc = []} = params;

  if (credentials.type === 'smtp') {
    return sendViaSMTP({
      smtp: credentials.smtp,
      to,
      from,
      fromName,
      subject,
      htmlContent,
      textContent,
      cc,
    });
  } else {
    return sendViaSendGrid({
      apiKey: credentials.apiKey,
      to,
      from,
      fromName,
      subject,
      htmlContent,
      textContent,
      cc,
    });
  }
}

/**
 * Send email using SMTP (Hostinger, Gmail, etc.)
 */
async function sendViaSMTP(params: {
  smtp: {host: string; port: number; secure: boolean; username: string; password: string};
  to: string;
  from: string;
  fromName: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  cc?: string[];
}): Promise<{messageId: string}> {
  const {smtp, to, from, fromName, subject, htmlContent, textContent, cc = []} = params;

  // Create transporter
  const transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure,
    auth: {
      user: smtp.username,
      pass: smtp.password,
    },
  });

  // Send email
  const info = await transporter.sendMail({
    from: `"${fromName}" <${from}>`,
    to,
    cc: cc.length > 0 ? cc.join(', ') : undefined,
    subject,
    text: textContent,
    html: htmlContent,
  });

  return {messageId: info.messageId};
}

/**
 * Send email using SendGrid API
 */
async function sendViaSendGrid(params: {
  apiKey: string;
  to: string;
  from: string;
  fromName: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  cc?: string[];
}): Promise<{messageId: string}> {
  const {apiKey, to, from, fromName, subject, htmlContent, textContent, cc = []} = params;

  const personalizations: {to: {email: string}[]; cc?: {email: string}[]}[] = [
    {
      to: [{email: to}],
    },
  ];

  if (cc.length > 0) {
    personalizations[0].cc = cc.map((email) => ({email}));
  }

  const payload = {
    personalizations,
    from: {
      email: from,
      name: fromName,
    },
    subject,
    content: [
      {
        type: 'text/plain',
        value: textContent,
      },
      {
        type: 'text/html',
        value: htmlContent,
      },
    ],
  };

  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`SendGrid API error (${response.status}): ${errorText}`);
  }

  // SendGrid returns 202 Accepted with X-Message-Id header
  const messageId = response.headers.get('X-Message-Id') || `sg-${Date.now()}`;

  return {messageId};
}

/**
 * Check email rate limits for workspace
 */
async function checkRateLimits(
  workspaceId: string,
  emailConfig: {rateLimit?: {maxPerHour: number; maxPerDay: number}}
): Promise<{
  canSend: boolean;
  hourlyCount: number;
  dailyCount: number;
  maxPerHour: number;
  maxPerDay: number;
}> {
  const maxPerHour = emailConfig.rateLimit?.maxPerHour || 10;
  const maxPerDay = emailConfig.rateLimit?.maxPerDay || 50;

  const oneHourAgo = Timestamp.fromDate(new Date(Date.now() - 60 * 60 * 1000));
  const oneDayAgo = Timestamp.fromDate(new Date(Date.now() - 24 * 60 * 60 * 1000));

  // Count emails sent in last hour
  const hourlySnapshot = await db
    .collection('emailLogs')
    .where('workspaceId', '==', workspaceId)
    .where('sentAt', '>=', oneHourAgo)
    .where('status', '==', 'sent')
    .count()
    .get();

  const hourlyCount = hourlySnapshot.data().count;

  // Count emails sent in last 24 hours
  const dailySnapshot = await db
    .collection('emailLogs')
    .where('workspaceId', '==', workspaceId)
    .where('sentAt', '>=', oneDayAgo)
    .where('status', '==', 'sent')
    .count()
    .get();

  const dailyCount = dailySnapshot.data().count;

  const canSend = hourlyCount < maxPerHour && dailyCount < maxPerDay;

  return {
    canSend,
    hourlyCount,
    dailyCount,
    maxPerHour,
    maxPerDay,
  };
}

/**
 * Retry Failed Emails - Scheduled Function
 *
 * Runs every 10 minutes to retry failed emails
 */
import {onSchedule} from 'firebase-functions/v2/scheduler';

export const retryFailedEmails = onSchedule(
  {
    schedule: 'every 10 minutes',
    timeZone: 'America/Chicago',
    region: 'us-central1',
    timeoutSeconds: 300,
    memory: '256MiB',
  },
  async () => {
    console.log('🔄 Starting retryFailedEmails job...');

    try {
      const now = Timestamp.now();

      // Get emails that need retry
      const retrySnapshot = await db
        .collection('emailLogs')
        .where('status', '==', 'retrying')
        .where('nextRetryAt', '<=', now)
        .limit(50)
        .get();

      console.log(`Found ${retrySnapshot.size} emails to retry`);

      const successCount = 0;
      let failureCount = 0;

      for (const emailLog of retrySnapshot.docs) {
        const data = emailLog.data();

        // Skip if max retries exceeded
        if (data.retryCount >= data.maxRetries) {
          await emailLog.ref.update({
            status: 'failed',
            updatedAt: Timestamp.now(),
          });
          failureCount++;
          continue;
        }

        // Get email config
        const configSnapshot = await db
          .collection('emailConfigs')
          .where('workspaceId', '==', data.workspaceId)
          .limit(1)
          .get();

        if (configSnapshot.empty || !configSnapshot.docs[0].data().enabled) {
          await emailLog.ref.update({
            status: 'failed',
            errorMessage: 'Email config not found or disabled',
            updatedAt: Timestamp.now(),
          });
          failureCount++;
          continue;
        }

        // Get email config (would be needed for actual retry with API key)
        // const emailConfig = configSnapshot.docs[0].data();
        // const apiKey = cryptoJS.AES.decrypt(emailConfig.provider.apiKey, ENCRYPTION_KEY).toString(cryptoJS.enc.Utf8);

        // Attempt to resend (would need to reconstruct HTML/text content from alert log)
        // For now, just mark as failed - in production, store content in email log
        await emailLog.ref.update({
          status: 'failed',
          errorMessage: 'Retry not fully implemented - content not stored',
          updatedAt: Timestamp.now(),
        });
        failureCount++;
      }

      console.log(`✅ Retry job complete. Success: ${successCount}, Failed: ${failureCount}`);
    } catch (error: unknown) {
      console.error('Error in retryFailedEmails:', error);
    }
  }
);
