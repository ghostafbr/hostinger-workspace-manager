import * as functions from 'firebase-functions/v2';
import * as admin from 'firebase-admin';

/**
 * Función HTTP para crear una alerta de prueba en Firestore
 * Endpoint: POST https://REGION-PROJECT.cloudfunctions.net/createTestAlert
 * Body: { email: "andres.fbramirez@gmail.com" }
 */
export const createTestAlert = functions.https.onRequest(
  {
    cors: true,
    region: 'us-central1',
  },
  async (req, res) => {
    try {
      // Solo permitir POST
      if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed. Use POST.' });
        return;
      }

      const testEmail = req.body.email || 'andres.fbramirez@gmail.com';

      functions.logger.info('🧪 Creating test alert...', { testEmail });

      const db = admin.firestore();

      // Obtener el primer workspace
      const workspacesSnapshot = await db.collection('workspaces').limit(1).get();

      if (workspacesSnapshot.empty) {
        res.status(404).json({
          error: 'No workspaces found. Create one first from the app.'
        });
        return;
      }

      const workspace = workspacesSnapshot.docs[0];
      const workspaceId = workspace.id;
      const workspaceName = workspace.data().name;

      functions.logger.info('✅ Using workspace:', { workspaceId, workspaceName });

      // Crear dominio de prueba único
      const timestamp = Date.now();
      const domainName = `test-domain-${timestamp}.com`;

      // Crear alerta de prueba
      const testAlert = {
        workspaceId: workspaceId,
        severity: 'warning' as const,
        channel: 'email' as const,
        type: 'domain_expiring' as const,
        entityId: domainName,
        entityName: domainName,
        message: `⚠️ PRUEBA DE EMAIL: El dominio ${domainName} vence en 7 días`,
        alertKey: `domain_expiring:${domainName}`,
        status: 'pending' as const,
        createdAt: admin.firestore.Timestamp.now(),
        metadata: {
          daysUntilExpiry: 7,
          expiryDate: admin.firestore.Timestamp.fromDate(
            new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          ),
          domainName: domainName,
          testEmail: testEmail,
          isPruebaEmail: true,
        },
      };

      const alertRef = await db.collection('alertLogs').add(testAlert);

      functions.logger.info('✅ Test alert created!', {
        alertId: alertRef.id,
        testEmail
      });

      res.status(200).json({
        success: true,
        message: 'Test alert created successfully!',
        data: {
          alertId: alertRef.id,
          workspaceId: workspaceId,
          workspaceName: workspaceName,
          domainName: domainName,
          testEmail: testEmail,
        },
        instructions: {
          message: 'Alert created. To send the email, call the sendEmail function with this alert ID.',
          command: `curl -X POST https://us-central1-hostinger-workspace-manager.cloudfunctions.net/sendEmail -H "Content-Type: application/json" -d '{"alertId": "${alertRef.id}"}'`
        }
      });
    } catch (error: unknown) {
      functions.logger.error('❌ Error creating test alert:', error);

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({
        success: false,
        error: 'Failed to create test alert',
        details: errorMessage,
      });
    }
  }
);
