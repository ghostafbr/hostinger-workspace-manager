import { Component, ChangeDetectionStrategy, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { MessageService } from 'primeng/api';
import { AlertService } from '@app/application';
import { AlertsTableComponent } from '@app/presentation/components/organisms/alerts-table/alerts-table.component';
import { AlertLogModel } from '@app/domain';

/**
 * Alerts Page Component
 *
 * Displays all alerts for a workspace with filtering
 */
@Component({
  selector: 'app-alerts-page',

  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CardModule,
    ButtonModule,
    SkeletonModule,
    ToastModule,
    ToolbarModule,
    AlertsTableComponent,
  ],
  providers: [MessageService],
  template: `
    <div class="fade-in">
      <!-- Toast Notifications -->
      <p-toast />

      <!-- Toolbar -->
      <p-toolbar class="alerts-toolbar">
        <div class="p-toolbar-group-start">
          <h1 class="app-page-title">
            <i class="pi pi-bell"></i>
            Alertas
          </h1>
        </div>

        <div class="p-toolbar-group-end">
          <p-button
            label="Actualizar"
            icon="pi pi-refresh"
            [outlined]="true"
            [loading]="isLoading()"
            (onClick)="loadAlerts()"
            pTooltip="Actualizar alertas"
            tooltipPosition="bottom"
          />
          <p-button
            label="Volver"
            icon="pi pi-arrow-left"
            severity="secondary"
            [outlined]="true"
            class="ml-2"
            (onClick)="goBack()"
          />
        </div>
      </p-toolbar>

      <!-- Main Content -->
      <div>
        <!-- Loading State -->
        @if (isLoading() && alerts().length === 0) {
          <p-card>
            <p-skeleton height="400px" />
          </p-card>
        }

        <!-- Error State -->
        @if (error() && !isLoading()) {
          <p-card>
            <div class="error-state">
              <i class="pi pi-exclamation-triangle"></i>
              <h2>Error al cargar alertas</h2>
              <p>{{ error() }}</p>
              <p-button label="Reintentar" icon="pi pi-refresh" (onClick)="loadAlerts()" />
            </div>
          </p-card>
        }

        <!-- Data Loaded -->
        @if (alerts().length > 0 || (!isLoading() && !error())) {
          <app-alerts-table
            [alerts]="alerts()"
            [isLoading]="isLoading()"
            (viewDetails)="onViewDetails($event)"
          />
        }
      </div>
    </div>
  `,
  styles: [
    `
      .alerts-toolbar {
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
        margin-bottom: 2rem;
        background: white;
        border-bottom: 1px solid var(--surface-200);
      }

      .error-state {
        text-align: center;
        padding: 3rem;

        i {
          font-size: 4rem;
          color: var(--red-500);
          margin-bottom: 1rem;
        }

        h2 {
          color: var(--text-color);
          margin-bottom: 0.5rem;
        }

        p {
          color: var(--text-color-secondary);
          margin-bottom: 2rem;
        }
      }
    `,
  ],
})
export default class AlertsPage implements OnInit {
  private readonly alertService = inject(AlertService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);

  readonly alerts = this.alertService.alerts;
  readonly isLoading = this.alertService.isLoading;
  readonly error = this.alertService.error;

  private readonly workspaceId = signal<string>('');

  ngOnInit(): void {
    // Get workspace ID from route params
    this.route.paramMap.subscribe((params) => {
      const id = params.get('workspaceId');
      if (id) {
        this.workspaceId.set(id);
        this.loadAlerts();
      }
    });
  }

  /**
   * Load alerts for current workspace
   */
  async loadAlerts(): Promise<void> {
    const id = this.workspaceId();
    if (!id) return;

    try {
      await this.alertService.getAlertsByWorkspace(id);
    } catch {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudieron cargar las alertas',
      });
    }
  }

  /**
   * Handle view details
   */
  onViewDetails(alert: AlertLogModel): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Detalles de Alerta',
      detail: `${alert.getEntityTypeLabel()}: ${alert.entityName} - ${alert.getDaysBeforeLabel()}`,
      life: 5000,
    });
  }

  /**
   * Navigate back
   */
  goBack(): void {
    const id = this.workspaceId();
    if (id) {
      this.router.navigate(['/w', id]);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }
}
