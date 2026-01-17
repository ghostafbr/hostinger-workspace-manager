import { Component, ChangeDetectionStrategy, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { MessageService } from 'primeng/api';
import { SyncRunService } from '@app/application';
import { SyncRunsTableComponent } from '@app/presentation/components/organisms/sync-runs-table/sync-runs-table.component';
import { SyncRun } from '@app/domain';

/**
 * Sync Runs Page Component
 *
 * Displays sync run history for a workspace
 */
@Component({
  selector: 'app-sync-runs-page',

  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CardModule,
    ButtonModule,
    SkeletonModule,
    ToastModule,
    ToolbarModule,
    SyncRunsTableComponent,
  ],
  providers: [MessageService],
  template: `
    <div class="fade-in">
      <!-- Toast Notifications -->
      <p-toast />

      <!-- Toolbar -->
      <p-toolbar class="sync-runs-toolbar">
        <div class="p-toolbar-group-start">
          <h1 class="app-page-title">
            <i class="pi pi-sync"></i>
            Historial de Sincronización
          </h1>
        </div>

        <div class="p-toolbar-group-end">
          <p-button
            label="Actualizar"
            icon="pi pi-refresh"
            [outlined]="true"
            [loading]="isLoading()"
            (onClick)="loadSyncRuns()"
            pTooltip="Actualizar historial"
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
        @if (isLoading() && syncRuns().length === 0) {
          <p-card>
            <p-skeleton height="400px" />
          </p-card>
        }

        <!-- Error State -->
        @if (error() && !isLoading()) {
          <p-card>
            <div class="error-state">
              <i class="pi pi-exclamation-triangle"></i>
              <h2>Error al cargar historial</h2>
              <p>{{ error() }}</p>
              <p-button label="Reintentar" icon="pi pi-refresh" (onClick)="loadSyncRuns()" />
            </div>
          </p-card>
        }

        <!-- Data Loaded -->
        @if (syncRuns().length > 0 || (!isLoading() && !error())) {
          <app-sync-runs-table
            [syncRuns]="syncRuns()"
            [isLoading]="isLoading()"
            (viewDetails)="onViewDetails($event)"
            (viewErrors)="onViewErrors($event)"
          />
        }
      </div>
    </div>
  `,
  styles: [
    `
      .sync-runs-toolbar {
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
export default class SyncRunsPage implements OnInit {
  private readonly syncRunService = inject(SyncRunService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);

  readonly syncRuns = this.syncRunService.syncRuns;
  readonly isLoading = this.syncRunService.isLoading;
  readonly error = this.syncRunService.error;

  private readonly workspaceId = signal<string>('');

  ngOnInit(): void {
    // Get workspace ID from route params
    this.route.paramMap.subscribe((params) => {
      const id = params.get('workspaceId');
      if (id) {
        this.workspaceId.set(id);
        this.loadSyncRuns();
      }
    });
  }

  /**
   * Load sync runs for current workspace
   */
  async loadSyncRuns(): Promise<void> {
    const id = this.workspaceId();
    if (!id) return;

    try {
      await this.syncRunService.getSyncRunsByWorkspace(id);
    } catch {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo cargar el historial de sincronizaciones',
      });
    }
  }

  /**
   * Handle view details
   */
  onViewDetails(run: SyncRun): void {
    const duration = run.getDurationMs();
    const durationStr = duration ? `${Math.floor(duration / 1000)}s` : 'En progreso';

    this.messageService.add({
      severity: 'info',
      summary: 'Detalles de Sincronización',
      detail: `
        Estado: ${run.status}
        Duración: ${durationStr}
        Dominios: ${run.domainsProcessed || 0}
        Suscripciones: ${run.subscriptionsProcessed || 0}
      `,
      life: 5000,
    });
  }

  /**
   * Handle view errors
   */
  onViewErrors(run: SyncRun): void {
    const errors = run.errors || [];
    this.messageService.add({
      severity: 'error',
      summary: `${errors.length} Error(es) en Sincronización`,
      detail: errors.map((e) => `• ${e.message}`).join('\n'),
      life: 10000,
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
