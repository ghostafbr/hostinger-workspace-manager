import { Routes } from '@angular/router';
import { authGuard } from './application/guards/auth.guard';
import { loginGuard } from './application/guards/login.guard';
import { workspaceGuard } from './application/guards/workspace.guard';
import { MainLayoutComponent } from './presentation/layouts/main-layout/main-layout.component';

export const routes: Routes = [
  // Public routes (without layout)
  {
    path: 'login',
    canActivate: [loginGuard],
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
        loadComponent: () => import('./presentation/pages/dashboard/dashboard.page'),
        data: { preload: true, preloadDelay: 1000 }, // Preload dashboard after 1s
      },
      {
        path: 'workspaces',
        loadComponent: () => import('./presentation/pages/workspaces/workspaces.page'),
        data: { preload: true, preloadDelay: 1500 }, // Preload workspaces after 1.5s
      },
      {
        path: 'workspaces/create',
        loadComponent: () => import('./presentation/pages/workspaces/workspace-form.page'),
      },
      {
        path: 'workspaces/edit/:id',
        loadComponent: () => import('./presentation/pages/workspaces/workspace-form.page'),
      },
      // Placeholder for future global routes
      {
        path: 'audit',
        loadComponent: () => import('./presentation/pages/audit-logs/audit-logs.page'),
      },
      {
        path: 'system-health',
        loadComponent: () => import('./presentation/pages/system-health/system-health.page'),
      },
      {
        path: 'email-config',
        loadComponent: () => import('./presentation/pages/email-config/email-config.page').then(m => m.EmailConfigPage),
      },
      {
        path: 'settings',
        loadComponent: () => import('./presentation/pages/dashboard/dashboard.page'), // Temporal
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
            loadComponent: () => import('./presentation/pages/dashboard/dashboard.page'),
          },
          {
            path: 'domains',
            loadComponent: () => import('./presentation/pages/domains/domains.page'),
          },
          {
            path: 'subscriptions',
            loadComponent: () => import('./presentation/pages/subscriptions/subscriptions.page'),
          },
          {
            path: 'alerts',
            loadComponent: () => import('./presentation/pages/alerts/alerts.page'),
          },
          {
            path: 'logs',
            loadComponent: () => import('./presentation/pages/sync-runs/sync-runs.page'),
          },
          {
            path: 'audit',
            loadComponent: () => import('./presentation/pages/audit-logs/audit-logs.page'),
          },
          {
            path: 'dns',
            loadComponent: () => import('./presentation/pages/dns/dns.page').then((m) => m.DnsPage),
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
