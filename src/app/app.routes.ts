import { Routes } from '@angular/router';
import { authGuard } from './application/guards/auth.guard';
import { workspaceGuard } from './application/guards/workspace.guard';
import { MainLayoutComponent } from './presentation/layouts/main-layout/main-layout.component';

export const routes: Routes = [
  // Public routes (without layout)
  {
    path: 'login',
    loadComponent: () => import('./presentation/pages/login/login.page'),
  },

  // Protected routes (with layout)
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      // ============================================
      // GLOBAL ROUTES (no workspace required)
      // ============================================
      {
        path: 'home',
        loadComponent: () =>
          import('./presentation/pages/dashboard/dashboard.page'),
      },
      {
        path: 'workspaces',
        loadComponent: () =>
          import('./presentation/pages/workspaces/workspaces.page'),
      },
      {
        path: 'workspaces/create',
        loadComponent: () =>
          import('./presentation/pages/workspaces/workspace-form.page'),
      },
      {
        path: 'workspaces/edit/:id',
        loadComponent: () =>
          import('./presentation/pages/workspaces/workspace-form.page'),
      },
      // Placeholder for future global routes
      {
        path: 'audit',
        loadComponent: () =>
          import('./presentation/pages/dashboard/dashboard.page'), // Temporal
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./presentation/pages/dashboard/dashboard.page'), // Temporal
      },

      // ============================================
      // WORKSPACE CONTEXTUAL ROUTES
      // ============================================
      {
        path: 'w/:workspaceId',
        canActivate: [workspaceGuard],
        children: [
          {
            path: 'dashboard',
            loadComponent: () =>
              import('./presentation/pages/dashboard/dashboard.page'),
          },
          {
            path: 'domains',
            loadComponent: () =>
              import('./presentation/pages/dashboard/dashboard.page'), // Temporal
          },
          {
            path: 'subscriptions',
            loadComponent: () =>
              import('./presentation/pages/dashboard/dashboard.page'), // Temporal
          },
          {
            path: 'alerts',
            loadComponent: () =>
              import('./presentation/pages/dashboard/dashboard.page'), // Temporal
          },
          {
            path: 'logs',
            loadComponent: () =>
              import('./presentation/pages/dashboard/dashboard.page'), // Temporal
          },
          {
            path: '',
            redirectTo: 'dashboard',
            pathMatch: 'full',
          },
        ],
      },

      // ============================================
      // DEFAULT REDIRECTS
      // ============================================
      {
        path: 'dashboard',
        redirectTo: '/home',
        pathMatch: 'full',
      },
      {
        path: '',
        redirectTo: '/home',
        pathMatch: 'full',
      },
    ],
  },

  // Wildcard - redirect to home
  {
    path: '**',
    redirectTo: '/home',
  },
];
