import { Routes } from '@angular/router';
import { authGuard } from './application/guards/auth.guard';
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
      {
        path: 'dashboard',
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
      // Default redirect
      {
        path: '',
        redirectTo: '/workspaces',
        pathMatch: 'full',
      },
    ],
  },

  // Wildcard - redirect to workspaces
  {
    path: '**',
    redirectTo: '/workspaces',
  },
];
