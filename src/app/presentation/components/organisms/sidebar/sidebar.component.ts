import { Component, ChangeDetectionStrategy, input, output, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { AuthService } from '@app/application/services/auth.service';
import { WorkspaceContextService } from '@app/application/services/workspace-context.service';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  badge?: string;
  disabled?: boolean;
}

/**
 * Sidebar Component
 *
 * Collapsible sidebar with Global and Workspace sections
 */
@Component({
  selector: 'app-sidebar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterModule, ButtonModule, TooltipModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  collapsed = input<boolean>(false);
  toggleSidebar = output<boolean>();

  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly workspaceContext = inject(WorkspaceContextService);

  readonly hasWorkspaceSelected = this.workspaceContext.hasWorkspaceSelected;
  readonly workspaceId = this.workspaceContext.workspaceId;

  // GLOBAL MENU ITEMS (always available)
  readonly globalMenuItems: MenuItem[] = [
    {
      label: 'Home',
      icon: 'pi pi-home',
      route: '/home',
    },
    {
      label: 'Workspaces',
      icon: 'pi pi-briefcase',
      route: '/workspaces',
    },
    {
      label: 'System Health',
      icon: 'pi pi-heart-fill',
      route: '/system-health',
    },
    {
      label: 'Auditoría',
      icon: 'pi pi-history',
      route: '/audit',
    },
    {
      label: 'Configuración',
      icon: 'pi pi-cog',
      route: '/settings',
    },
  ];

  // WORKSPACE MENU ITEMS (only when workspace selected)
  readonly workspaceMenuItems: MenuItem[] = [
    {
      label: 'Dashboard',
      icon: 'pi pi-chart-line',
      route: 'dashboard',
    },
    {
      label: 'Dominios',
      icon: 'pi pi-globe',
      route: 'domains',
    },
    {
      label: 'Suscripciones',
      icon: 'pi pi-credit-card',
      route: 'subscriptions',
    },
    {
      label: 'Alertas',
      icon: 'pi pi-bell',
      route: 'alerts',
    },
    {
      label: 'Logs',
      icon: 'pi pi-list',
      route: 'logs',
    },
  ];

  onToggle(): void {
    this.toggleSidebar.emit(!this.collapsed());
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  isActiveRoute(route: string): boolean {
    return this.router.url === route || this.router.url.startsWith(route + '/');
  }

  /**
   * Construye la ruta completa del workspace contextual
   */
  getWorkspaceRoute(route: string): string[] {
    const workspaceId = this.workspaceId();
    if (!workspaceId) return [];
    return ['/w', workspaceId, route];
  }

  async logout(): Promise<void> {
    this.workspaceContext.clearWorkspace();
    await this.authService.signOut();
    this.router.navigate(['/login']);
  }
}
