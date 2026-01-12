const cryptoJS = require('crypto-js');

// Claves posibles
const keys = [
  'hostinger-workspace-manager-secret-key-2026',
  'hostinger-workspace-manager-secret-key-2026-prod',
  'hostinger-workspace-encryption-key-2026-secure-32chars'
];

// Obtener la contraseña cifrada de los argumentos
const encryptedPassword = process.argv[2];

if (!encryptedPassword) {
  console.log('Uso: node test-decrypt.js "<contraseña_cifrada>"');
  console.log('\nEjemplo:');
  console.log('  node test-decrypt.js "U2FsdGVkX1+abc123..."');
  process.exit(1);
}

console.log('\n🔐 Probando descifrado de contraseña...\n');
console.log(`Contraseña cifrada (primeros 50 chars): ${encryptedPassword.substring(0, 50)}...\n`);

keys.forEach((key, index) => {
  try {
    const decrypted = cryptoJS.AES.decrypt(encryptedPassword, key).toString(cryptoJS.enc.Utf8);

    if (decrypted && decrypted.length > 0) {
      console.log(`✅ Clave ${index + 1}: ${key}`);
      console.log(`   Contraseña descifrada (longitud: ${decrypted.length})`);
      console.log(`   Primeros 5 chars: ${decrypted.substring(0, 5)}***\n`);
    } else {
      console.log(`❌ Clave ${index + 1}: ${key}`);
      console.log(`   No se pudo descifrar (resultado vacío)\n`);
    }
  } catch (error) {
    console.log(`❌ Clave ${index + 1}: ${key}`);
    console.log(`   Error: ${error.message}\n`);
  }
});

console.log('Nota: La clave correcta es la que produce una contraseña válida.');
