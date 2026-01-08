import { Component, EventEmitter, Output, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { AuthService } from '@app/application/services/auth.service';
import { Router } from '@angular/router';

/**
 * Header Component
 *
 * Application top bar with user menu and actions
 */
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, ButtonModule, AvatarModule, MenuModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  @Output() toggleSidebar = new EventEmitter<void>();

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly currentUser = this.authService.currentUser;
  readonly userInitials = computed(() => {
    const user = this.currentUser();
    if (!user?.email) return 'U';
    return user.email.charAt(0).toUpperCase();
  });

  readonly userMenuItems: MenuItem[] = [
    {
      label: 'Perfil',
      icon: 'pi pi-user',
      command: () => this.router.navigate(['/profile']),
    },
    {
      label: 'Configuración',
      icon: 'pi pi-cog',
      command: () => this.router.navigate(['/settings']),
    },
    {
      separator: true,
    },
    {
      label: 'Cerrar Sesión',
      icon: 'pi pi-sign-out',
      command: () => this.logout(),
    },
  ];

  onToggleSidebar(): void {
    this.toggleSidebar.emit();
  }

  async logout(): Promise<void> {
    await this.authService.signOut();
    this.router.navigate(['/login']);
  }
}
