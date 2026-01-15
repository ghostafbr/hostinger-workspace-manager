const fs = require('fs');
const path = require('path');

// Read .env file
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8');
  envConfig.split('\n').forEach(line => {
    // Skip comments and empty lines
    if (!line || line.trim().startsWith('#')) return;
    
    // Split by first equals sign only
    const splitIndex = line.indexOf('=');
    if (splitIndex === -1) return;
    
    const key = line.substring(0, splitIndex).trim();
    const value = line.substring(splitIndex + 1).trim();
    
    if (key) {
      process.env[key] = value;
    }
  });
  console.log('Loaded environment variables from .env');
} else {
  console.warn('.env file not found at ' + envPath);
}

const dir = 'src/environments';
const prodFile = 'environment.ts';
const devFile = 'environment.development.ts';

const content = `import { Environment } from './environment.interface';

export const environment: Environment = {
  production: ${process.env.PRODUCTION === 'true'},
  version: '${process.env.APP_VERSION || "0.0.0"}',
  encryptionKey: '${process.env.ENCRYPTION_KEY || "dev-key"}',
  cloudFunctionsUrl: '${process.env.CLOUD_FUNCTIONS_URL || "https://us-central1-hostinger-workspace-manager.cloudfunctions.net"}',
  firebase: {
    apiKey: '${process.env.FIREBASE_API_KEY || "mock-api-key"}',
    authDomain: '${process.env.FIREBASE_AUTH_DOMAIN || "mock-auth-domain"}',
    projectId: '${process.env.FIREBASE_PROJECT_ID || "mock-project-id"}',
    storageBucket: '${process.env.FIREBASE_STORAGE_BUCKET || "mock-storage-bucket"}',
    messagingSenderId: '${process.env.FIREBASE_MESSAGING_SENDER_ID || "mock-sender-id"}',
    appId: '${process.env.FIREBASE_APP_ID || "mock-app-id"}',
    measurementId: '${process.env.FIREBASE_MEASUREMENT_ID || "mock-measurement-id"}'
  },
  api: {
    hostinger: {
      baseUrl: '${process.env.HOSTINGER_API_URL || "https://api.hostinger.com/v1"}',
      timeout: 10000
    }
  }
};
`;

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

fs.writeFileSync(path.join(dir, prodFile), content);
fs.writeFileSync(path.join(dir, devFile), content);

console.log(`Created ${prodFile} and ${devFile} in ${dir}`);
