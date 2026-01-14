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
import { ConfirmationService, MessageService } from 'primeng/api';

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
import { CriticalWorkspacesWidgetComponent, AdvancedSearchComponent } from '@app/presentation';

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
    ExpirationTrendsChartComponent,
    UpcomingEventsTimelineComponent,
    CriticalWorkspacesWidgetComponent,
    AdvancedSearchComponent,
  ],
  providers: [ConfirmationService, MessageService],
  animations: [fadeIn, slideUp, listStagger],
  templateUrl: './dashboard.page.html',
  styleUrl: './dashboard.page.scss',
})
export default class DashboardPage implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  private readonly workspaceService = inject(WorkspaceService);
  private readonly authService = inject(AuthService);
  private readonly exportService = inject(ExportService);
  private readonly router = inject(Router);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

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
  readonly isSearchCollapsed = signal<boolean>(true); // Colapsado por defecto
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
    this.router.navigate(['/workspaces', workspace.id]);
  }

  /**
   * Handle search applied
   */
  onSearchApplied(_criteria: unknown): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Filtro Aplicado',
      detail: 'Búsqueda aplicada correctamente',
      life: 3000,
    });
    this.navigateToWorkspaces();
  }

  /**
   * Handle search cleared
   */
  onSearchCleared(): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Filtros Limpiados',
      detail: 'Todos los filtros han sido removidos',
      life: 3000,
    });
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

  toggleSearch(): void {
    this.isSearchCollapsed.update((v) => !v);
  }

  toggleCharts(): void {
    this.isChartsCollapsed.update((v) => !v);
  }

  toggleTimeline(): void {
    this.isTimelineCollapsed.update((v) => !v);
  }
}
