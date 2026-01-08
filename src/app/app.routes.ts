import { Routes } from '@angular/router';
import { authGuard } from './application/guards/auth.guard';

export const routes: Routes = [
  // Public routes
  {
    path: 'login',
    loadComponent: () => import('./presentation/pages/login/login.page'),
  },

  // Protected routes
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./presentation/pages/dashboard/dashboard.page'),
    canActivate: [authGuard],
  },

  // Default redirect
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full',
  },

  // Wildcard - redirect to dashboard
  {
    path: '**',
    redirectTo: '/dashboard',
  },
];
