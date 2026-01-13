import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('authGuard', () => {
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

  it('should allow access when user is authenticated', async () => {
    vi.mocked(authService.waitForAuthInit).mockResolvedValue();
    vi.mocked(authService.isAuthenticated).mockReturnValue(true);

    const result = await TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));

    expect(result).toBe(true);
    expect(authService.waitForAuthInit).toHaveBeenCalled();
    expect(authService.isAuthenticated).toHaveBeenCalled();
  });

  it('should redirect to login when user is not authenticated', async () => {
    const urlTree = {} as any;
    vi.mocked(authService.waitForAuthInit).mockResolvedValue();
    vi.mocked(authService.isAuthenticated).mockReturnValue(false);
    vi.mocked(router.createUrlTree).mockReturnValue(urlTree);

    const result = await TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));

    expect(result).toBe(urlTree);
    expect(router.createUrlTree).toHaveBeenCalledWith(['/login']);
  });

  it('should wait for auth initialization before checking authentication', async () => {
    let authInitialized = false;
    vi.mocked(authService.waitForAuthInit).mockImplementation(async () => {
      authInitialized = true;
    });
    vi.mocked(authService.isAuthenticated).mockImplementation(() => {
      expect(authInitialized).toBe(true);
      return true;
    });

    await TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));

    expect(authService.waitForAuthInit).toHaveBeenCalled();
  });
});
