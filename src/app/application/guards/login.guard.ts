import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Login Guard
 *
 * Prevents authenticated users from accessing the login page.
 * Redirects authenticated users to /home.
 */
export const loginGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Wait for auth to initialize
  await authService.waitForAuthInit();

  // If user is authenticated, redirect to home
  if (authService.isAuthenticated()) {
    return router.createUrlTree(['/home']);
  }

  // Allow access to login page
  return true;
};
