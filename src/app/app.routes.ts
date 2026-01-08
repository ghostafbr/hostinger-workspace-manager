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
  {
    path: 'workspaces',
    loadComponent: () =>
      import('./presentation/pages/workspaces/workspaces.page'),
    canActivate: [authGuard],
  },
  {
    path: 'workspaces/create',
    loadComponent: () =>
      import('./presentation/pages/workspaces/workspace-form.page'),
    canActivate: [authGuard],
  },
  {
    path: 'workspaces/edit/:id',
    loadComponent: () =>
      import('./presentation/pages/workspaces/workspace-form.page'),
    canActivate: [authGuard],
  },

  // Default redirect
  {
    path: '',
    redirectTo: '/workspaces',
    pathMatch: 'full',
  },

  // Wildcard - redirect to workspaces
  {
    path: '**',
    redirectTo: '/workspaces',
  },
];
