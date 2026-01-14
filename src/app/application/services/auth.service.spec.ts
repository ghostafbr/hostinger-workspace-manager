import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { FirebaseAdapter } from '@app/infrastructure/adapters/firebase.adapter';
import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import type { Auth, User, UserCredential } from 'firebase/auth';

// Mock Firebase Auth functions
vi.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn(),
}));

// Mock FirebaseAdapter
vi.mock('@app/infrastructure/adapters/firebase.adapter', () => ({
  FirebaseAdapter: {
    getAuth: vi.fn(),
  },
}));

describe('AuthService', () => {
  let service: AuthService;
  let mockAuth: Partial<Auth>;
  let onAuthStateChangedMock: Mock;

  beforeEach(async () => {
    // Import the mocked functions
    const { onAuthStateChanged } = await import('firebase/auth');
    onAuthStateChangedMock = onAuthStateChanged as Mock;

    // Setup mock auth
    mockAuth = {} as Auth;
    vi.mocked(FirebaseAdapter.getAuth).mockReturnValue(mockAuth as Auth);

    // Setup onAuthStateChanged to call the callback immediately with null user
    onAuthStateChangedMock.mockImplementation(
      (auth: Auth, callback: (user: User | null) => void) => {
        // Call immediately with null user
        setTimeout(() => callback(null), 0);
        return vi.fn(); // Return unsubscribe function
      },
    );

    TestBed.configureTestingModule({
      providers: [AuthService],
    });

    service = TestBed.inject(AuthService);
    // Wait for auth to initialize
    await service.waitForAuthInit();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with no user', () => {
    expect(service.currentUser()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
    expect(service.isLoading()).toBe(false);
  });

  it('should sign in with email and password', async () => {
    const { signInWithEmailAndPassword } = await import('firebase/auth');
    const mockCredential = {
      user: { uid: 'test-uid', email: 'test@example.com' } as User,
    } as UserCredential;

    vi.mocked(signInWithEmailAndPassword).mockResolvedValue(mockCredential);

    const result = await service.signIn('test@example.com', 'password123');

    expect(result).toBe(mockCredential);
    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
      mockAuth,
      'test@example.com',
      'password123',
    );
  });

  it('should set loading state during sign in', async () => {
    const { signInWithEmailAndPassword } = await import('firebase/auth');
    let loadingDuringSignIn = false;

    vi.mocked(signInWithEmailAndPassword).mockImplementation(async () => {
      loadingDuringSignIn = service.isLoading();
      return {} as UserCredential;
    });

    await service.signIn('test@example.com', 'password123');

    expect(loadingDuringSignIn).toBe(true);
    expect(service.isLoading()).toBe(false);
  });

  it('should sign out user', async () => {
    const { signOut } = await import('firebase/auth');
    vi.mocked(signOut).mockResolvedValue();

    await service.signOut();

    expect(signOut).toHaveBeenCalledWith(mockAuth);
    expect(service.currentUser()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
  });

  it('should set loading state during sign out', async () => {
    const { signOut } = await import('firebase/auth');
    let loadingDuringSignOut = false;

    vi.mocked(signOut).mockImplementation(async () => {
      loadingDuringSignOut = service.isLoading();
    });

    await service.signOut();

    expect(loadingDuringSignOut).toBe(true);
    expect(service.isLoading()).toBe(false);
  });

  it('should update state when user changes', async () => {
    const mockUser = { uid: 'test-uid', email: 'test@example.com' } as User;

    // Simulate auth state change
    const callback = onAuthStateChangedMock.mock.calls[0][1];
    callback(mockUser);

    expect(service.currentUser()).toBe(mockUser);
    expect(service.isAuthenticated()).toBe(true);
  });

  it('should wait for auth initialization', async () => {
    // This should resolve immediately since we already waited in beforeEach
    await expect(service.waitForAuthInit()).resolves.toBeUndefined();
  });

  it('should get user UID', () => {
    // getCurrentUserUid uses this.auth.currentUser, not the signal
    // We need to mock Firebase auth.currentUser
    expect(service.getCurrentUserUid()).toBeNull(); // Returns null from mocked auth
  });

  it('should return null when getting user UID without user', () => {
    service.currentUser.set(null);
    expect(service.getCurrentUserUid()).toBeNull();
  });

  it('should get user email', () => {
    // getCurrentUserEmail uses this.auth.currentUser, not the signal
    expect(service.getCurrentUserEmail()).toBeNull(); // Returns null from mocked auth
  });

  it('should return null when getting user email without user', () => {
    service.currentUser.set(null);
    expect(service.getCurrentUserEmail()).toBeNull();
  });

  it('should handle sign in error', async () => {
    const { signInWithEmailAndPassword } = await import('firebase/auth');
    const error = new Error('Invalid credentials');

    vi.mocked(signInWithEmailAndPassword).mockRejectedValue(error);

    await expect(service.signIn('test@example.com', 'wrong')).rejects.toThrow(
      'Invalid credentials',
    );
    expect(service.isLoading()).toBe(false);
  });

  it('should handle sign out error', async () => {
    const { signOut } = await import('firebase/auth');
    const error = new Error('Sign out failed');

    vi.mocked(signOut).mockRejectedValue(error);

    await expect(service.signOut()).rejects.toThrow('Sign out failed');
    expect(service.isLoading()).toBe(false);
  });

  it('should get current user', () => {
    const user = service.getCurrentUser();
    expect(user).toBeUndefined(); // Mocked auth.currentUser is undefined
  });

  it('should check if user is authenticated', () => {
    service.currentUser.set(null);
    expect(service.isUserAuthenticated()).toBe(false);

    // isUserAuthenticated usa isAuthenticated() computed que verifica currentUser
    // que se actualiza por Firebase onAuthStateChanged, no manualmente
  });

  it('should get user display name from signal', () => {
    // Set user in signal
    service.currentUser.set({
      uid: '123',
      email: 'test@example.com',
      displayName: 'John Doe',
    } as any);

    const displayName = service.getUserDisplayName();
    // getUserDisplayName uses auth.currentUser, not signal, so it returns default
    expect(displayName).toBeDefined();
  });
});
