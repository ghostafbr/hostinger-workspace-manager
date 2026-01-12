// Ejecutar desde Firebase Console o Firebase Functions Shell
// firebase functions:shell
// > crearAlertaPrueba()

const admin = require('firebase-admin');
const db = admin.firestore();

async function crearAlertaPrueba() {
  try {
    console.log('🔍 Buscando workspaces...');

    // Obtener el primer workspace
    const workspacesSnapshot = await db.collection('workspaces').limit(1).get();

    if (workspacesSnapshot.empty) {
      console.log('❌ No hay workspaces. Ve a la app y crea uno primero.');
      return;
    }

    const workspace = workspacesSnapshot.docs[0];
    const workspaceId = workspace.id;
    const workspaceName = workspace.data().name;

    console.log(`✅ Workspace encontrado: ${workspaceName}`);

    // Timestamp para dominio de prueba único
    const timestamp = Date.now();
    const domainName = `test-domain-${timestamp}.com`;

    // Crear alerta de prueba
    const testAlert = {
      workspaceId: workspaceId,
      severity: 'warning',
      channel: 'email',
      type: 'domain_expiring',
      entityId: domainName,
      entityName: domainName,
      message: `⚠️ PRUEBA: El dominio ${domainName} vence en 7 días`,
      alertKey: `domain_expiring:${domainName}`,
      status: 'pending',
      createdAt: admin.firestore.Timestamp.now(),
      metadata: {
        daysUntilExpiry: 7,
        expiryDate: admin.firestore.Timestamp.fromDate(
          new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        ),
        domainName: domainName,
        testEmail: 'andres.fbramirez@gmail.com',
        isPruebaEmail: true
      }
    };

    console.log('📝 Creando alerta...');
    const alertRef = await db.collection('alertLogs').add(testAlert);

    console.log('');
    console.log('✅ ¡Alerta creada exitosamente!');
    console.log('📋 Alert ID:', alertRef.id);
    console.log('📧 Email destino: andres.fbramirez@gmail.com');
    console.log('');
    console.log('🧪 Ahora ejecuta para enviar el email:');
    console.log(`   sendEmail({alertId: "${alertRef.id}"})`);
    console.log('');

    return {
      success: true,
      alertId: alertRef.id,
      workspaceId: workspaceId,
      domainName: domainName
    };
  } catch (error) {
    console.error('❌ Error:', error);
    return { success: false, error: error.message };
  }
}

// Exportar para usar en Firebase Shell
exports.crearAlertaPrueba = crearAlertaPrueba;
