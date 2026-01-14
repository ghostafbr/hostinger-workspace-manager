/**
 * Environment configuration interface
 * All environment files must implement this structure
 */
export interface Environment {
  production: boolean;
  version: string;
  encryptionKey: string;
  cloudFunctionsUrl: string;
  firebase: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    measurementId?: string;
  };
  api: {
    hostinger: {
      baseUrl: string;
      timeout: number;
    };
  };
}
