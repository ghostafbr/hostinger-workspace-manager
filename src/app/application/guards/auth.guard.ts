import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Authentication Guard
 *
 * Protects routes from unauthenticated access.
 * Redirects to /login if user is not authenticated.
 */
export const authGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Wait for auth to initialize
  await authService.waitForAuthInit();

  // Check if user is authenticated
  if (authService.isAuthenticated()) {
    return true;
  }

  // Redirect to login page
  return router.createUrlTree(['/login']);
};
