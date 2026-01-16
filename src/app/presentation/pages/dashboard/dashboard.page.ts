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
import { ExportService } from '@app/application';
import { ConfirmationService, MessageService, MenuItem } from 'primeng/api';
import { SplitButtonModule } from 'primeng/splitbutton';
import { MenuModule } from 'primeng/menu';

// Animations
import { fadeIn, slideUp, listStagger } from '@app/infrastructure';

// Components
import { ExpirationCardComponent } from '@app/presentation/components/molecules/expiration-card/expiration-card.component';
import { WorkspacesAlertPanelComponent } from '@app/presentation/components/molecules/workspaces-alert-panel/workspaces-alert-panel.component';
import {
  ExpirationTrendsChartComponent,
  type ExpirationTrendData,
} from '@app/presentation/components/organisms/expiration-trends-chart/expiration-trends-chart.component';
import {
  UpcomingEventsTimelineComponent,
  type TimelineEvent,
} from '@app/presentation/components/organisms/upcoming-events-timeline/upcoming-events-timeline.component';
import { CriticalWorkspacesWidgetComponent } from '@app/presentation';
import { DomainStatusChartComponent } from '@app/presentation/components/organisms/domain-status-chart/domain-status-chart.component';

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
    SplitButtonModule, // Added
    MenuModule, // Added
    ExpirationCardComponent,
    WorkspacesAlertPanelComponent,
    ExpirationTrendsChartComponent,
    UpcomingEventsTimelineComponent,
    CriticalWorkspacesWidgetComponent,
    DomainStatusChartComponent,
  ],
  providers: [ConfirmationService, MessageService],
  animations: [fadeIn, slideUp, listStagger],
  template: `
    <div class="dashboard-container" @fadeIn role="main">
      <p-toast />
      <p-confirmDialog />

      <p-toolbar class="dashboard-toolbar">
        <div class="p-toolbar-group-start">
          <div class="toolbar-left-content">
            <h1 class="dashboard-title">
              <i class="pi pi-chart-line"></i>
              Dashboard
            </h1>
            @if (stats() && !isLoading()) {
              <div class="welcome-inline">
                <span class="welcome-user">Hola, {{ userDisplayName() }}</span>
                @if (hasIssues()) {
                  <span class="status-text warning-text">
                    <i class="pi pi-exclamation-circle"></i>
                    {{ stats()!.domainsExpiring7Days + stats()!.subscriptionsExpiring7Days }}
                    vencimientos
                  </span>
                } @else {
                  <span class="status-text success-text">
                    <i class="pi pi-check-circle"></i>
                    Todo en orden
                  </span>
                }
              </div>
            }
          </div>
        </div>

        <div class="p-toolbar-group-end">
          <p-button
            label="Ver Workspaces"
            icon="pi pi-briefcase"
            severity="success"
            size="small"
            (onClick)="navigateToWorkspaces()"
            class="mr-2"
          />
          <p-splitButton
            label="Actualizar"
            icon="pi pi-refresh"
            [model]="toolbarActions()"
            severity="secondary"
            [outlined]="true"
            size="small"
            (onClick)="loadDashboard()"
          ></p-splitButton>
        </div>
      </p-toolbar>

      <div class="dashboard-content">
        @if (isLoading()) {
          <p-skeleton height="20rem" />
        }

        @if (stats() && !isLoading()) {
          <div class="stats-section-container">
            <div class="section-title-row">
              <h3><i class="pi pi-chart-bar"></i> Estadísticas Rápidas</h3>
            </div>
            <div class="compact-stats-grid">
              <app-expiration-card
                title="Dominios"
                icon="pi pi-globe"
                [totalCount]="stats()!.totalDomains"
                [count7Days]="stats()!.domainsExpiring7Days"
                [count15Days]="stats()!.domainsExpiring15Days"
                [count30Days]="stats()!.domainsExpiring30Days"
                [count60Days]="stats()!.domainsExpiring60Days"
                class="glass-card full-height"
              />
              <app-expiration-card
                title="Suscripciones"
                icon="pi pi-ticket"
                [totalCount]="stats()!.totalSubscriptions"
                [count7Days]="stats()!.subscriptionsExpiring7Days"
                [count15Days]="stats()!.subscriptionsExpiring15Days"
                [count30Days]="stats()!.subscriptionsExpiring30Days"
                [count60Days]="stats()!.subscriptionsExpiring60Days"
                class="glass-card full-height"
              />
              <div class="glass-card summary-card-container">
                <h3>Resumen</h3>
                <div>Workspaces: {{ stats()!.totalWorkspaces }}</div>
              </div>
            </div>
          </div>

          @if (stats()!.workspacesInError.length > 0) {
            <div class="alert-section mb-4">
              <app-workspaces-alert-panel [workspaces]="stats()!.workspacesInError" />
            </div>
          }

          <div class="critical-section mb-4">
            <app-critical-workspaces-widget
              [workspaces]="allWorkspaces()"
              [maxItems]="5"
              (workspaceClicked)="navigateToWorkspace($event)"
            />
          </div>

          <div class="charts-grid mb-4">
            <app-domain-status-chart [stats]="stats()" title="Estado de Dominios" />
            <app-expiration-trends-chart [data]="expirationTrends()" title="Tendencias" />
          </div>

          <div class="mb-4">
            <app-upcoming-events-timeline [events]="upcomingEvents()" title="Próximos" />
          </div>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .dashboard-container {
        min-height: 100vh;
      }
      .dashboard-toolbar {
        margin-bottom: 2rem;
        animation: slideDown 0.3s ease-out;
      }
      .dashboard-title {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        font-weight: 700;
        font-size: 1.5rem;
      }
      .dashboard-content {
        margin: 0 auto;
      }
      .stats-section-container {
        margin-bottom: 2rem;
      }
      .section-title-row {
        margin-bottom: 1.5rem;
      }
      .compact-stats-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1.5rem;
      }
      .charts-grid {
        display: grid;
        grid-template-columns: 1fr 2fr;
        gap: 1.5rem;
      }
      .glass-card {
        background: white;
        border-radius: 20px;
        padding: 1.5rem;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
      }

      @media (max-width: 992px) {
        .compact-stats-grid,
        .charts-grid {
          grid-template-columns: 1fr;
        }
      }

      .welcome-inline {
        display: flex;
        align-items: center;
        gap: 2rem;
        margin-top: 0.5rem;
        color: #64748b;
      }

      .welcome-user {
        font-weight: 500;
        color: #334155;
      }
    `,
  ],
})
export default class DashboardPage implements OnInit {
  // ... existing injections ...
  private readonly dashboardService = inject(DashboardService);
  private readonly workspaceService = inject(WorkspaceService);
  private readonly authService = inject(AuthService);
  private readonly exportService = inject(ExportService);
  private readonly router = inject(Router);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  // Toolbar Menu Actions
  readonly toolbarActions = computed<MenuItem[]>(() => [
    {
      label: 'Actualizar Datos',
      icon: 'pi pi-refresh',
      command: () => this.loadDashboard(),
    },
    {
      separator: true,
    },
    {
      label: 'Sincronizar Global',
      icon: 'pi pi-sync',
      command: () => this.syncAllWorkspaces(),
    },
    {
      label: 'Exportar CSV',
      icon: 'pi pi-download',
      command: () => this.exportToCSV(),
    },
    {
      separator: true,
    },
    {
      label: 'Salir',
      icon: 'pi pi-sign-out',
      styleClass: 'text-red-500',
      command: () => this.onLogout(),
    },
  ]);

  readonly stats = this.dashboardService.stats;
  readonly isLoading = this.dashboardService.isLoading;
  readonly error = this.dashboardService.error;
  readonly isSyncingAll = signal<boolean>(false);

  readonly currentUser = this.authService.currentUser;

  // New signals for dashboard enhancements
  readonly upcomingEvents = signal<TimelineEvent[]>([]);
  readonly expirationTrends = signal<ExpirationTrendData[]>([]);
  readonly isLoadingEvents = signal<boolean>(false);
  readonly allWorkspaces = this.workspaceService.workspaces;

  // Collapse states for dashboard sections
  readonly isStatsCollapsed = signal<boolean>(false);
  readonly isAlertsCollapsed = signal<boolean>(false);
  readonly isCriticalCollapsed = signal<boolean>(false);
  readonly isChartsCollapsed = signal<boolean>(false);
  readonly isTimelineCollapsed = signal<boolean>(false);

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
    this.loadEnhancedData();
  }

  /**
   * Load dashboard data
   */
  async loadDashboard(): Promise<void> {
    try {
      await this.dashboardService.loadDashboardStats();
      // Load all workspaces for critical widget
      await this.workspaceService.getAllWorkspaces();
      // Update trends when stats are loaded
      this.expirationTrends.set(this.dashboardService.getExpirationTrends());
    } catch {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudieron cargar las estadísticas del dashboard',
      });
    }
  }

  /**
   * Load enhanced data (timeline events)
   */
  async loadEnhancedData(): Promise<void> {
    try {
      this.isLoadingEvents.set(true);
      const events = await this.dashboardService.getUpcomingEvents(10);
      this.upcomingEvents.set(events);
    } catch (error) {
      console.error('Error loading upcoming events:', error);
    } finally {
      this.isLoadingEvents.set(false);
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
            detail: `Total: ${result.totalWorkspaces} - Éxitos: ${result.successCount} - Fallos: ${result.failureCount}`,
            life: 8000,
          });

          // Refresh dashboard stats
          await this.loadDashboard();
          await this.loadEnhancedData();
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
   * Export dashboard data to CSV
   */
  exportToCSV(): void {
    const events = this.upcomingEvents();
    if (events.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Sin datos',
        detail: 'No hay eventos para exportar',
        life: 3000,
      });
      return;
    }

    const exportData = events.map((event) => ({
      Título: event.title,
      Tipo: event.type === 'domain' ? 'Dominio' : 'Suscripción',
      Workspace: event.workspaceName,
      'Fecha de Vencimiento': event.expirationDate.toLocaleDateString('es-ES'),
      'Días Restantes': event.daysUntilExpiration,
      Estado:
        event.status === 'critical'
          ? 'Crítico'
          : event.status === 'warning'
            ? 'Advertencia'
            : 'Info',
    }));

    const filename = `dashboard-vencimientos-${new Date().toISOString().split('T')[0]}.csv`;
    this.exportService.exportToCSV(exportData, filename);

    this.messageService.add({
      severity: 'success',
      summary: 'Exportado',
      detail: `Datos exportados a ${filename}`,
      life: 3000,
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

  /**
   * Navigate to specific workspace
   */
  navigateToWorkspace(workspace: { id: string }): void {
    if (!workspace || !workspace.id) {
      return;
    }
    // Correct route is /w/:id/dashboard
    this.router.navigate(['/w', workspace.id, 'dashboard']);
  }

  /**
   * Toggle collapse states
   */
  toggleStats(): void {
    this.isStatsCollapsed.update((v) => !v);
  }

  toggleAlerts(): void {
    this.isAlertsCollapsed.update((v) => !v);
  }

  toggleCritical(): void {
    this.isCriticalCollapsed.update((v) => !v);
  }

  toggleCharts(): void {
    this.isChartsCollapsed.update((v) => !v);
  }

  toggleTimeline(): void {
    this.isTimelineCollapsed.update((v) => !v);
  }
}
