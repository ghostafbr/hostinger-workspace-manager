import {
  Component,
  ChangeDetectionStrategy,
  inject,
  OnInit,
  signal,
  computed,
} from '@angular/core';
import { Router } from '@angular/router';

// PrimeNG Imports
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToolbarModule } from 'primeng/toolbar';
import { ChipModule } from 'primeng/chip';

// Services
import { DashboardService } from '@app/application/services/dashboard.service';
import { WorkspaceService } from '@app/application/services/workspace.service';
import { AuthService } from '@app/application/services/auth.service';
import { ConfirmationService, MessageService } from 'primeng/api';

// Components
import { ExpirationCardComponent } from '@app/presentation/components/molecules/expiration-card/expiration-card.component';
import { WorkspacesAlertPanelComponent } from '@app/presentation/components/molecules/workspaces-alert-panel/workspaces-alert-panel.component';

/**
 * Dashboard Page Component
 *
 * Main dashboard showing:
 * - Expiration statistics (domains & subscriptions)
 * - Workspaces with errors
 * - Quick actions (Sync All)
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CardModule,
    ButtonModule,
    SkeletonModule,
    ToastModule,
    ConfirmDialogModule,
    ToolbarModule,
    ChipModule,
    ExpirationCardComponent,
    WorkspacesAlertPanelComponent,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './dashboard.page.html',
  styleUrl: './dashboard.page.scss',
})
export default class DashboardPage implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  private readonly workspaceService = inject(WorkspaceService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  readonly stats = this.dashboardService.stats;
  readonly isLoading = this.dashboardService.isLoading;
  readonly error = this.dashboardService.error;
  readonly isSyncingAll = signal<boolean>(false);

  readonly currentUser = this.authService.currentUser;

  /**
   * Get user display name
   */
  readonly userDisplayName = computed(() => this.authService.getUserDisplayName());

  /**
   * Check if there are any issues
   */
  readonly hasIssues = computed(() => {
    const s = this.stats();
    if (!s) return false;
    return (
      s.domainsExpiring7Days > 0 ||
      s.subscriptionsExpiring7Days > 0 ||
      s.workspacesInError.length > 0
    );
  });

  ngOnInit(): void {
    this.loadDashboard();
  }

  /**
   * Load dashboard data
   */
  async loadDashboard(): Promise<void> {
    try {
      await this.dashboardService.loadDashboardStats();
    } catch {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudieron cargar las estadísticas del dashboard',
      });
    }
  }

  /**
   * Navigate to workspaces
   */
  navigateToWorkspaces(): void {
    this.router.navigate(['/workspaces']);
  }

  /**
   * Sync All Workspaces (Manual Trigger)
   *
   * Executes batch synchronization for all active workspaces.
   */
  async syncAllWorkspaces(): Promise<void> {
    this.confirmationService.confirm({
      message: '¿Deseas sincronizar TODOS los workspaces activos? Esto puede tomar varios minutos.',
      header: 'Confirmar Sincronización Global',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, sincronizar',
      rejectLabel: 'Cancelar',
      accept: async () => {
        try {
          this.isSyncingAll.set(true);
          this.messageService.add({
            severity: 'info',
            summary: 'Sincronización Iniciada',
            detail: 'Sincronizando todos los workspaces activos...',
            life: 3000,
          });

          const result = await this.workspaceService.syncAllWorkspaces();

          this.messageService.add({
            severity: 'success',
            summary: 'Sincronización Completada',
            detail: `
              Total: ${result.totalWorkspaces} workspaces
              ✅ Éxitos: ${result.successCount}
              ❌ Fallos: ${result.failureCount}
              ⏭️ Saltados: ${result.skippedCount}
              🚫 Deshabilitados: ${result.disabledCount}
            `,
            life: 8000,
          });

          // Refresh dashboard stats
          await this.loadDashboard();
        } catch (error) {
          this.messageService.add({
            severity: 'error',
            summary: 'Error en Sincronización',
            detail: error instanceof Error ? error.message : 'Error desconocido',
            life: 5000,
          });
        } finally {
          this.isSyncingAll.set(false);
        }
      },
    });
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
