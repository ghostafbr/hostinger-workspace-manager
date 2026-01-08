import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { environment } from '../../../environments/environment.development';

/**
 * Firebase Service Adapter
 * Initializes and provides Firebase services (Auth, Firestore)
 * This is part of the Infrastructure layer
 */
export class FirebaseAdapter {
  private static app: FirebaseApp | null = null;
  private static authInstance: Auth | null = null;
  private static firestoreInstance: Firestore | null = null;

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
}
