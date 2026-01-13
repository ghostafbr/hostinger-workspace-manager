import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { loginGuard } from './login.guard';
import { AuthService } from '../services/auth.service';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('loginGuard', () => {
  let authService: AuthService;
  let router: Router;

  beforeEach(() => {
    const authServiceMock = {
      waitForAuthInit: vi.fn(),
      isAuthenticated: vi.fn(),
    };

    const routerMock = {
      createUrlTree: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    });

    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
  });

  it('should allow access to login page when user is not authenticated', async () => {
    vi.mocked(authService.waitForAuthInit).mockResolvedValue();
    vi.mocked(authService.isAuthenticated).mockReturnValue(false);

    const result = await TestBed.runInInjectionContext(() => loginGuard({} as any, {} as any));

    expect(result).toBe(true);
    expect(authService.waitForAuthInit).toHaveBeenCalled();
    expect(authService.isAuthenticated).toHaveBeenCalled();
  });

  it('should redirect to home when user is already authenticated', async () => {
    const urlTree = {} as any;
    vi.mocked(authService.waitForAuthInit).mockResolvedValue();
    vi.mocked(authService.isAuthenticated).mockReturnValue(true);
    vi.mocked(router.createUrlTree).mockReturnValue(urlTree);

    const result = await TestBed.runInInjectionContext(() => loginGuard({} as any, {} as any));

    expect(result).toBe(urlTree);
    expect(router.createUrlTree).toHaveBeenCalledWith(['/home']);
  });

  it('should wait for auth initialization before checking authentication', async () => {
    let authInitialized = false;
    vi.mocked(authService.waitForAuthInit).mockImplementation(async () => {
      authInitialized = true;
    });
    vi.mocked(authService.isAuthenticated).mockImplementation(() => {
      expect(authInitialized).toBe(true);
      return false;
    });

    await TestBed.runInInjectionContext(() => loginGuard({} as any, {} as any));

    expect(authService.waitForAuthInit).toHaveBeenCalled();
  });
});
