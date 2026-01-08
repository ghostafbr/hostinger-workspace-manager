import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '@app/application/services/auth.service';

// PrimeNG Imports
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { AvatarModule } from 'primeng/avatar';

/**
 * Dashboard Page Component
 *
 * Main dashboard for authenticated users
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    ToolbarModule,
    AvatarModule,
  ],
  templateUrl: './dashboard.page.html',
  styleUrl: './dashboard.page.scss',
})
export default class DashboardPage {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly currentUser = this.authService.currentUser;

  /**
   * Get user display name
   */
  get userDisplayName(): string {
    return this.authService.getUserDisplayName();
  }

  /**
   * Get user email
   */
  get userEmail(): string {
    return this.authService.getCurrentUserEmail() || '';
  }

  /**
   * Handle logout
   */
  async onLogout(): Promise<void> {
    try {
      await this.authService.signOut();
      await this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }
}
