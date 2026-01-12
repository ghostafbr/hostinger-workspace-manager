import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

initializeApp();
const db = getFirestore();

async function getEmailConfig() {
  try {
    const snapshot = await db.collection('emailConfigs').limit(1).get();

    if (snapshot.empty) {
      console.log('❌ No se encontró configuración de email');
      return;
    }

    const doc = snapshot.docs[0];
    const data = doc.data();

    console.log('\n📧 Configuración de Email encontrada:\n');
    console.log(`Workspace ID: ${data.workspaceId}`);
    console.log(`Provider Type: ${data.providerType}`);
    console.log(`Recipient: ${data.recipientEmail}`);
    console.log(`\nSMTP Config:`);
    console.log(`  Host: ${data.provider?.smtp?.host}`);
    console.log(`  Port: ${data.provider?.smtp?.port}`);
    console.log(`  Username: ${data.provider?.smtp?.username}`);
    console.log(`\nContraseña cifrada:`);
    console.log(data.provider?.smtp?.password);
    console.log('\n');

  } catch (error) {
    console.error('Error:', error);
  }

  process.exit(0);
}

getEmailConfig();
