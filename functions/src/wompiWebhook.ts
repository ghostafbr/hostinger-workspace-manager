import * as functions from 'firebase-functions/v2';
import * as admin from 'firebase-admin';
import * as crypto from 'crypto';

const db = admin.firestore();

/**
 * Wompi Payment Webhook
 *
 * Receives payment confirmations from Wompi and:
 * 1. Validates the webhook signature
 * 2. Updates domain status if payment is approved
 * 3. Sends confirmation email to customer
 *
 * Wompi webhook documentation:
 * https://docs.wompi.co/docs/es/eventos
 */
export const wompiWebhook = functions.https.onRequest(
  {
    cors: true,
    memory: '256MiB',
    timeoutSeconds: 60,
  },
  async (req, res) => {
    functions.logger.info('🔔 Received Wompi webhook');

    // Only accept POST requests
    if (req.method !== 'POST') {
      functions.logger.warn('Invalid method:', req.method);
      res.status(405).send('Method not allowed');
      return;
    }

    try {
      const event = req.body;

      functions.logger.info('Webhook event:', {
        event: event.event,
        transactionId: event.data?.transaction?.id,
        status: event.data?.transaction?.status,
      });

      // Validate webhook signature
      const signature = req.headers['x-event-checksum'] as string;
      const isValid = validateWompiSignature(event, signature);

      if (!isValid) {
        functions.logger.warn('⚠️ Invalid webhook signature');
        res.status(401).send('Invalid signature');
        return;
      }

      // Process transaction.updated event
      if (event.event === 'transaction.updated') {
        await processTransactionUpdate(event.data);
      }

      res.status(200).send('OK');
    } catch (error: unknown) {
      functions.logger.error('Error processing webhook:', error);
      res.status(500).send('Internal server error');
    }
  }
);

/**
 * Validate Wompi webhook signature
 */
function validateWompiSignature(event: Record<string, unknown>, signature: string): boolean {
  // Get integrity key from environment
  const integrityKey = process.env.WOMPI_INTEGRITY_KEY;

  if (!integrityKey) {
    functions.logger.warn('WOMPI_INTEGRITY_KEY not configured');
    return false;
  }

  try {
    // Wompi signature format: timestamp.signature
    const [timestamp, providedSignature] = signature.split('.');

    // Create payload: timestamp.event_json
    const payload = `${timestamp}.${JSON.stringify(event)}`;

    // Calculate expected signature
    const expectedSignature = crypto
      .createHmac('sha256', integrityKey)
      .update(payload)
      .digest('hex');

    return providedSignature === expectedSignature;
  } catch (error) {
    functions.logger.error('Error validating signature:', error);
    return false;
  }
}

/**
 * Process transaction update event
 */
async function processTransactionUpdate(data: {
  transaction: {
    id: string;
    reference: string;
    status: string;
    amount_in_cents: number;
    customer_email: string;
    payment_method_type?: string;
    created_at?: string;
  };
}): Promise<void> {
  const transaction = data.transaction;

  functions.logger.info('Processing transaction:', {
    id: transaction.id,
    reference: transaction.reference,
    status: transaction.status,
  });

  // Only process approved transactions
  if (transaction.status !== 'APPROVED') {
    functions.logger.info('Transaction not approved, skipping');
    return;
  }

  // Extract domain name from reference (format: domainname-timestamp)
  const domainName = transaction.reference.split('-')[0];

  functions.logger.info('Looking for domain:', domainName);

  // Find domain by name
  const domainsSnapshot = await db
    .collection('domains')
    .where('domainName', '==', domainName)
    .limit(1)
    .get();

  if (domainsSnapshot.empty) {
    functions.logger.warn('Domain not found:', domainName);
    return;
  }

  const domainDoc = domainsSnapshot.docs[0];
  const domain = domainDoc.data() as {
    domainName: string;
    workspaceId: string;
    contactEmail?: string;
  };

  functions.logger.info('Found domain:', domainDoc.id);

  // 🔒 PROTECTION 1: Check if transaction ID already exists (Wompi duplicate webhook)
  const existingTransactionSnapshot = await db
    .collection('payments')
    .where('transactionId', '==', transaction.id)
    .limit(1)
    .get();

  if (!existingTransactionSnapshot.empty) {
    functions.logger.warn('⚠️ Transaction already processed (duplicate webhook), skipping:', transaction.id);
    return;
  }

  // 🔒 PROTECTION 2: Check if domain has recent approved payment (prevent double payment)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentPaymentSnapshot = await db
    .collection('payments')
    .where('domainId', '==', domainDoc.id)
    .where('status', '==', 'APPROVED')
    .where('paidAt', '>=', thirtyDaysAgo)
    .limit(1)
    .get();

  if (!recentPaymentSnapshot.empty) {
    const recentPayment = recentPaymentSnapshot.docs[0].data();
    functions.logger.warn('⚠️ Domain already has recent payment, skipping to prevent duplicate:', {
      domainId: domainDoc.id,
      domainName: domain.domainName,
      existingPaymentId: recentPaymentSnapshot.docs[0].id,
      existingTransactionId: recentPayment.transactionId,
      paidAt: recentPayment.paidAt,
    });
    return;
  }

  // Create payment record
  await db.collection('payments').add({
    domainId: domainDoc.id,
    domainName: domain.domainName,
    workspaceId: domain.workspaceId,
    transactionId: transaction.id,
    reference: transaction.reference,
    status: transaction.status,
    amount: transaction.amount_in_cents / 100,
    customerEmail: transaction.customer_email,
    paymentMethod: transaction.payment_method_type || 'unknown',
    paidAt: transaction.created_at ? new Date(transaction.created_at) : admin.firestore.FieldValue.serverTimestamp(),
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  functions.logger.info('✅ Payment record created');

  // Cancel pending alerts for this domain
  const alertsSnapshot = await db
    .collection('alerts')
    .where('metadata.entityId', '==', domainDoc.id)
    .where('status', '==', 'pending')
    .get();

  const batch = db.batch();

  alertsSnapshot.docs.forEach((alertDoc) => {
    batch.update(alertDoc.ref, {
      status: 'cancelled',
      cancelledReason: 'Payment received',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  });

  await batch.commit();

  functions.logger.info(`✅ Cancelled ${alertsSnapshot.size} pending alerts`);

  // Send confirmation email
  await sendPaymentConfirmationEmail(domain, transaction);
}

/**
 * Send payment confirmation email
 */
async function sendPaymentConfirmationEmail(
  domain: {
    domainName: string;
    workspaceId: string;
    contactEmail?: string;
  },
  transaction: {
    id: string;
    reference: string;
    amount_in_cents: number;
    customer_email: string;
  }
): Promise<void> {
  try {
    // Get email configuration for workspace
    const emailConfigDoc = await db
      .collection('emailConfigs')
      .where('workspaceId', '==', domain.workspaceId)
      .limit(1)
      .get();

    if (emailConfigDoc.empty) {
      functions.logger.warn('No email config found for workspace');
      return;
    }

    const emailConfig = emailConfigDoc.docs[0].data();
    const recipientEmail = domain.contactEmail || transaction.customer_email;

    // Create confirmation email log
    const emailLog = {
      workspaceId: domain.workspaceId,
      type: 'payment_confirmation',
      recipientEmail,
      bccEmail: emailConfig.recipientEmail, // Send copy to admin
      subject: `✅ Pago Confirmado - ${domain.domainName}`,
      htmlBody: generateConfirmationEmailHTML(domain, transaction),
      textBody: generateConfirmationEmailText(domain, transaction),
      status: 'pending',
      priority: 'normal',
      metadata: {
        domainName: domain.domainName,
        transactionId: transaction.id,
        amount: transaction.amount_in_cents / 100,
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db.collection('emailLogs').add(emailLog);

    functions.logger.info('✅ Confirmation email queued');
  } catch (error) {
    functions.logger.error('Error sending confirmation email:', error);
  }
}

/**
 * Generate HTML confirmation email
 */
function generateConfirmationEmailHTML(
  domain: { domainName: string },
  transaction: { id: string; reference: string; amount_in_cents: number }
): string {
  const amount = (transaction.amount_in_cents / 100).toLocaleString('es-CO');

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pago Confirmado</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #F3F4F6;">
  <div style="max-width: 600px; margin: 40px auto; background: #FFFFFF; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

    <!-- Header -->
    <div style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); padding: 2rem; text-align: center;">
      <div style="font-size: 3rem; margin-bottom: 1rem;">✅</div>
      <h1 style="color: #FFFFFF; margin: 0; font-size: 1.75rem;">Pago Confirmado</h1>
    </div>

    <!-- Content -->
    <div style="padding: 2rem;">
      <p style="font-size: 1.1rem; color: #374151; margin-bottom: 1.5rem;">
        Tu pago ha sido procesado exitosamente.
      </p>

      <!-- Payment Details -->
      <div style="background: #F9FAFB; border-left: 4px solid #10B981; padding: 1.5rem; margin-bottom: 2rem;">
        <h2 style="color: #1F2937; font-size: 1.1rem; margin: 0 0 1rem 0;">Detalles del Pago</h2>

        <div style="margin-bottom: 0.75rem;">
          <strong style="color: #4B5563;">Dominio:</strong>
          <span style="color: #1F2937;">${domain.domainName}</span>
        </div>

        <div style="margin-bottom: 0.75rem;">
          <strong style="color: #4B5563;">Monto:</strong>
          <span style="color: #1F2937; font-size: 1.2rem; font-weight: 600;">$${amount} COP</span>
        </div>

        <div style="margin-bottom: 0.75rem;">
          <strong style="color: #4B5563;">Referencia:</strong>
          <span style="color: #6B7280; font-family: monospace;">${transaction.reference}</span>
        </div>

        <div>
          <strong style="color: #4B5563;">ID Transacción:</strong>
          <span style="color: #6B7280; font-family: monospace; font-size: 0.85rem;">${transaction.id}</span>
        </div>
      </div>

      <p style="color: #4B5563; line-height: 1.6;">
        Gracias por tu pago. Tu dominio será renovado próximamente.
      </p>

      <p style="color: #6B7280; font-size: 0.9rem; margin-top: 2rem;">
        Si tienes alguna pregunta, no dudes en contactarnos.
      </p>
    </div>

    <!-- Footer -->
    <div style="background: #F9FAFB; padding: 1.5rem; text-align: center; border-top: 1px solid #E5E7EB;">
      <p style="color: #6B7280; font-size: 0.85rem; margin: 0;">
        Este es un correo automático, por favor no responder.
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Generate text confirmation email
 */
function generateConfirmationEmailText(
  domain: { domainName: string },
  transaction: { id: string; reference: string; amount_in_cents: number }
): string {
  const amount = (transaction.amount_in_cents / 100).toLocaleString('es-CO');

  return `
✅ PAGO CONFIRMADO

Tu pago ha sido procesado exitosamente.

DETALLES DEL PAGO:
==================
Dominio: ${domain.domainName}
Monto: $${amount} COP
Referencia: ${transaction.reference}
ID Transacción: ${transaction.id}

Gracias por tu pago. Tu dominio será renovado próximamente.

Si tienes alguna pregunta, no dudes en contactarnos.

---
Este es un correo automático, por favor no responder.
  `;
}
