import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getFunctions, Functions } from 'firebase/functions';
import { environment } from 'environments/environment';

/**
 * Firebase Service Adapter
 * Initializes and provides Firebase services (Auth, Firestore, Functions)
 * This is part of the Infrastructure layer
 */
export class FirebaseAdapter {
  private static app: FirebaseApp | null = null;
  private static authInstance: Auth | null = null;
  private static firestoreInstance: Firestore | null = null;
  private static functionsInstance: Functions | null = null;

  /**
   * Initialize Firebase App
   * Should be called once at application startup
   */
  static initialize(): void {
    if (this.app) {
      console.warn('Firebase already initialized');
      return;
    }

    this.app = initializeApp(environment.firebase);
    console.log('✅ Firebase initialized successfully');
  }

  /**
   * Get Firebase App instance
   */
  static getApp(): FirebaseApp {
    if (!this.app) {
      throw new Error('Firebase not initialized. Call FirebaseAdapter.initialize() first.');
    }
    return this.app;
  }

  /**
   * Get Firebase Auth instance
   */
  static getAuth(): Auth {
    if (!this.authInstance) {
      this.authInstance = getAuth(this.getApp());
      // Configurar persistencia LOCAL (por defecto, pero aseguramos explícitamente)
      setPersistence(this.authInstance, browserLocalPersistence).catch((error) => {
        console.error('Error setting auth persistence:', error);
      });
    }
    return this.authInstance;
  }

  /**
   * Get Firestore instance
   */
  static getFirestore(): Firestore {
    if (!this.firestoreInstance) {
      this.firestoreInstance = getFirestore(this.getApp());
    }
    return this.firestoreInstance;
  }

  /**
   * Get Firebase Functions instance
   * Configured for us-central1 region
   * Always uses production endpoint (even in development)
   */
  static getFunctions(): Functions {
    if (!this.functionsInstance) {
      this.functionsInstance = getFunctions(this.getApp(), 'us-central1');
      console.log('✅ Firebase Functions initialized for region: us-central1');
    }
    return this.functionsInstance;
  }
}
