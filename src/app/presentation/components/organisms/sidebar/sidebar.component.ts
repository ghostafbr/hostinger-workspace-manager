import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { AuthService } from '@app/application/services/auth.service';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  badge?: string;
}

/**
 * Sidebar Component
 *
 * Collapsible sidebar navigation menu
 */
@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule, TooltipModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  @Input() collapsed = false;
  @Output() toggleSidebar = new EventEmitter<boolean>();

  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  readonly menuItems: MenuItem[] = [
    {
      label: 'Dashboard',
      icon: 'pi pi-home',
      route: '/dashboard',
    },
    {
      label: 'Workspaces',
      icon: 'pi pi-briefcase',
      route: '/workspaces',
    },
    {
      label: 'Dominios',
      icon: 'pi pi-globe',
      route: '/domains',
    },
    {
      label: 'Suscripciones',
      icon: 'pi pi-credit-card',
      route: '/subscriptions',
    },
  ];

  onToggle(): void {
    this.toggleSidebar.emit(!this.collapsed);
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  isActiveRoute(route: string): boolean {
    return this.router.url === route || this.router.url.startsWith(route + '/');
  }

  async logout(): Promise<void> {
    await this.authService.signOut();
    this.router.navigate(['/login']);
  }
}
