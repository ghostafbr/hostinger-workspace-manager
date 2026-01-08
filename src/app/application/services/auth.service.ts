import { Injectable, signal } from '@angular/core';
import {
  Auth,
  User,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  UserCredential,
} from 'firebase/auth';
import { FirebaseAdapter } from '@app/infrastructure/adapters/firebase.adapter';

/**
 * Authentication Service
 *
 * Handles user authentication using Firebase Auth.
 * Only supports login - NO registration from UI.
 * Users must be created manually in Firebase Console.
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly auth: Auth = FirebaseAdapter.getAuth();

  // Current authenticated user (signal for reactivity)
  readonly currentUser = signal<User | null>(null);

  // Loading state
  readonly isLoading = signal<boolean>(true);

  // Authentication state
  readonly isAuthenticated = signal<boolean>(false);

  // Promise that resolves when auth state is initialized
  private authInitialized: Promise<void>;
  private authInitializedResolver!: () => void;

  constructor() {
    // Create promise that resolves when auth is initialized
    this.authInitialized = new Promise((resolve) => {
      this.authInitializedResolver = resolve;
    });
    this.initAuthListener();
  }

  /**
   * Initialize authentication state listener
   */
  private initAuthListener(): void {
    onAuthStateChanged(this.auth, (user) => {
      this.currentUser.set(user);
      this.isAuthenticated.set(!!user);
      this.isLoading.set(false);

      // Resolver la promesa en la primera ejecución
      if (this.authInitializedResolver) {
        this.authInitializedResolver();
        this.authInitializedResolver = null as any;
      }
    });
  }

  /**
   * Sign in with email and password
   *
   * @param email - User email
   * @param password - User password
   * @returns Promise with UserCredential
   * @throws FirebaseError if authentication fails
   */
  async signIn(email: string, password: string): Promise<UserCredential> {
    try {
      this.isLoading.set(true);
      const credential = await signInWithEmailAndPassword(
        this.auth,
        email,
        password,
      );
      return credential;
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Sign out current user
   *
   * @returns Promise that resolves when sign out is complete
   */
  async signOut(): Promise<void> {
    try {
      this.isLoading.set(true);
      await signOut(this.auth);
      this.currentUser.set(null);
      this.isAuthenticated.set(false);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Get current user
   *
   * @returns Current Firebase user or null
   */
  getCurrentUser(): User | null {
    return this.auth.currentUser;
  }

  /**
   * Get current user UID
   *
   * @returns User UID or null
   */
  getCurrentUserUid(): string | null {
    return this.auth.currentUser?.uid ?? null;
  }

  /**
   * Get current user email
   *
   * @returns User email or null
   */
  getCurrentUserEmail(): string | null {
    return this.auth.currentUser?.email ?? null;
  }

  /**
   * Check if user is authenticated
   *
   * @returns True if user is authenticated
   */
  isUserAuthenticated(): boolean {
    return this.isAuthenticated();
  }

  /**
   * Get user display name
   *
   * @returns User display name or email
   */
  getUserDisplayName(): string {
    const user = this.getCurrentUser();
    return user?.displayName || user?.email || 'Usuario';
  }

  /**
   * Wait for auth state to be initialized
   *
   * @returns Promise that resolves when auth state is known
   */
  async waitForAuthInit(): Promise<void> {
    return this.authInitialized;
  }
}
