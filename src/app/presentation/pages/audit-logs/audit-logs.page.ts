import { Component, ChangeDetectionStrategy, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { MessageService } from 'primeng/api';
import { AuditLogService } from '@app/application';
import { AuditLogsTableComponent } from '@app/presentation/components/organisms/audit-logs-table/audit-logs-table.component';
import { AuditLogModel } from '@app/domain';

/**
 * Audit Logs Page Component
 *
 * Displays audit logs with filtering capabilities
 */
@Component({
  selector: 'app-audit-logs-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CardModule,
    ButtonModule,
    SkeletonModule,
    ToastModule,
    ToolbarModule,
    AuditLogsTableComponent,
  ],
  providers: [MessageService],
  template: `
    <div class="audit-logs-container">
      <!-- Toast Notifications -->
      <p-toast />

      <!-- Toolbar -->
      <p-toolbar styleClass="audit-logs-toolbar">
        <div class="p-toolbar-group-start">
          <h1 class="page-title">
            <i class="pi pi-file"></i>
            Audit Logs
          </h1>
        </div>

        <div class="p-toolbar-group-end">
          <p-button
            label="Actualizar"
            icon="pi pi-refresh"
            [outlined]="true"
            [loading]="isLoading()"
            (onClick)="loadAuditLogs()"
            pTooltip="Actualizar logs"
            tooltipPosition="bottom"
          />
          <p-button
            label="Volver"
            icon="pi pi-arrow-left"
            severity="secondary"
            [outlined]="true"
            styleClass="ml-2"
            (onClick)="goBack()"
          />
        </div>
      </p-toolbar>

      <!-- Main Content -->
      <div class="audit-logs-content">
        <!-- Loading State -->
        @if (isLoading() && auditLogs().length === 0) {
          <p-card>
            <p-skeleton height="400px" />
          </p-card>
        }

        <!-- Error State -->
        @if (error() && !isLoading()) {
          <p-card>
            <div class="error-state">
              <i class="pi pi-exclamation-triangle"></i>
              <h2>Error al cargar audit logs</h2>
              <p>{{ error() }}</p>
              <p-button label="Reintentar" icon="pi pi-refresh" (onClick)="loadAuditLogs()" />
            </div>
          </p-card>
        }

        <!-- Data Loaded -->
        @if (auditLogs().length > 0 || (!isLoading() && !error())) {
          <app-audit-logs-table
            [auditLogs]="auditLogs()"
            [isLoading]="isLoading()"
            (viewDetails)="onViewDetails($event)"
          />
        }
      </div>
    </div>
  `,
  styles: [
    `
      .audit-logs-container {
        min-height: 100vh;
        background-color: var(--surface-50);
      }

      .audit-logs-toolbar {
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
        margin-bottom: 2rem;
        background: white;
        border-bottom: 1px solid var(--surface-200);
      }

      .page-title {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        font-weight: 700;
        font-size: 1.5rem;
        color: var(--text-color);
        margin: 0;

        i {
          color: var(--primary-color);
        }
      }

      .audit-logs-content {
        max-width: 1400px;
        margin: 0 auto;
        padding: 0 2rem 2rem;
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

      @media (max-width: 768px) {
        .page-title {
          font-size: 1.25rem;
        }

        .audit-logs-content {
          padding: 0 1rem 1rem;
        }
      }
    `,
  ],
})
export default class AuditLogsPage implements OnInit {
  private readonly auditLogService = inject(AuditLogService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);

  readonly auditLogs = this.auditLogService.auditLogs;
  readonly isLoading = this.auditLogService.isLoading;
  readonly error = this.auditLogService.error;

  private readonly workspaceId = signal<string | undefined>(undefined);

  ngOnInit(): void {
    // Check if workspace-specific route
    this.route.paramMap.subscribe((params) => {
      const id = params.get('workspaceId');
      if (id) {
        this.workspaceId.set(id);
      }
      this.loadAuditLogs();
    });
  }

  /**
   * Load audit logs
   */
  async loadAuditLogs(): Promise<void> {
    try {
      const id = this.workspaceId();
      if (id) {
        await this.auditLogService.getWorkspaceAuditLogs(id);
      } else {
        await this.auditLogService.getRecentAuditLogs();
      }
    } catch {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudieron cargar los audit logs',
      });
    }
  }

  /**
   * Handle view details
   */
  onViewDetails(log: AuditLogModel): void {
    const metaStr = log.meta ? JSON.stringify(log.meta, null, 2) : 'N/A';
    this.messageService.add({
      severity: 'info',
      summary: `${log.getActionLabel()} - ${log.getStatusLabel()}`,
      detail: `Usuario: ${log.actorEmail || log.actorUid}\n${log.errorMessage || metaStr}`,
      life: 8000,
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
