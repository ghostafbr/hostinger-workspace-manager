const admin = require('firebase-admin');

// Inicializar Firebase Admin con el proyecto correcto
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'hostinger-workspace-manager',
  });
}

const db = admin.firestore();

async function addPaymentOptions() {
  try {
    console.log('🔍 Buscando configuración de email...');

    // Buscar el emailConfig (asumiendo que hay uno solo o tomar el primero)
    const emailConfigsSnapshot = await db.collection('emailConfigs').limit(1).get();

    if (emailConfigsSnapshot.empty) {
      console.error('❌ No se encontró ninguna configuración de email');
      process.exit(1);
    }

    const emailConfigDoc = emailConfigsSnapshot.docs[0];
    const emailConfigId = emailConfigDoc.id;
    const currentData = emailConfigDoc.data();

    console.log('📧 Configuración encontrada:', emailConfigId);
    console.log('   Workspace:', currentData.workspaceId);

    // Opciones de pago mock
    const paymentOptions = {
      wompiPublicKey: 'pub_test_QVgKb2ZkZXZ0ZXN0XzEyMzQ1Njc4OTAx',
      bancolombia: {
        accountType: 'ahorros',
        accountNumber: '12345678900',
        ownerName: 'Andrés Felipe Bolaños',
        ownerDocument: 'CC 1234567890',
      },
      nequi: {
        phoneNumber: '3001234567',
        ownerName: 'Andrés Felipe Bolaños',
      },
    };

    // Actualizar el documento
    await db.collection('emailConfigs').doc(emailConfigId).update({
      paymentOptions,
      updatedAt: admin.firestore.Timestamp.now(),
    });

    console.log('✅ Opciones de pago agregadas exitosamente:');
    console.log('   - Wompi Public Key:', paymentOptions.wompiPublicKey);
    console.log('   - Bancolombia:', paymentOptions.bancolombia.accountNumber);
    console.log('   - Nequi:', paymentOptions.nequi.phoneNumber);

    console.log('\n📋 Próximo paso:');
    console.log('   1. Ve a Firestore Console y selecciona un dominio');
    console.log('   2. Agrega estos campos:');
    console.log('      - contactEmail (string): "andres.fbramirez@gmail.com"');
    console.log('      - renewalPrice (number): 50000');
    console.log('   3. Luego ejecuta "Enviar Email de Prueba" desde la UI');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addPaymentOptions();
