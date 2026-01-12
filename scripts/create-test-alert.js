/**
 * Script para crear una alerta de prueba en Firestore
 * Ejecutar con: firebase functions:shell
 * Luego ejecutar: createTestAlert()
 */

const admin = require('firebase-admin');

// Inicializar Firebase Admin (usa las credenciales por defecto)
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

async function createTestAlert() {
  try {
    console.log('🔍 Buscando workspaces...');

    // Obtener el primer workspace disponible
    const workspacesSnapshot = await db.collection('workspaces').limit(1).get();

    if (workspacesSnapshot.empty) {
      console.error('❌ No se encontraron workspaces. Crea uno primero desde la aplicación.');
      process.exit(1);
    }

    const workspace = workspacesSnapshot.docs[0];
    const workspaceId = workspace.id;
    const workspaceName = workspace.data().name;

    console.log(`✅ Usando workspace: ${workspaceName} (${workspaceId})`);

    // Crear alerta de prueba
    const testAlert = {
      workspaceId: workspaceId,
      severity: 'warning',
      channel: 'email',
      type: 'domain_expiring',
      entityId: 'test-domain-' + Date.now() + '.com',
      entityName: 'test-domain-' + Date.now() + '.com',
      message: 'El dominio test-domain.com vence en 7 días - PRUEBA DE EMAIL SMTP',
      alertKey: 'domain_expiring:test-domain-' + Date.now() + '.com',
      status: 'pending',
      createdAt: admin.firestore.Timestamp.now(),
      metadata: {
        daysUntilExpiry: 7,
        expiryDate: admin.firestore.Timestamp.fromDate(
          new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        ),
        domainName: 'test-domain.com',
        testEmail: 'andres.fbramirez@gmail.com'
      }
    };

    console.log('📝 Creando alerta de prueba...');
    const alertRef = await db.collection('alertLogs').add(testAlert);

    console.log('✅ Alerta creada exitosamente!');
    console.log('📋 ID de alerta:', alertRef.id);
    console.log('');
    console.log('🧪 Para probar el envío de email, ejecuta:');
    console.log(`   firebase functions:shell`);
    console.log(`   > sendEmail({alertId: "${alertRef.id}"})`);
    console.log('');
    console.log('O espera a que la función programada generateAlerts la procese automáticamente.');
    console.log('📧 Email de destino: andres.fbramirez@gmail.com');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creando alerta:', error);
    process.exit(1);
  }
}

createTestAlert();
