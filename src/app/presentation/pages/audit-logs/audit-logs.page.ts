import { Component, ChangeDetectionStrategy, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { MessageService } from 'primeng/api';
import { AuditLogService } from '@app/application';
import { AuditLogModel, AuditAction, AuditStatus } from '@app/domain';

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
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    SkeletonModule,
    ToastModule,
    ToolbarModule,
    TableModule,
    TagModule,
    TooltipModule,
    InputTextModule,
    SelectModule,
  ],
  providers: [MessageService],
  templateUrl: './audit-logs.page.html',
  styleUrls: ['./audit-logs.page.scss'],
})
export default class AuditLogsPage implements OnInit {
  private readonly auditLogService = inject(AuditLogService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);

  // Data Signals
  readonly auditLogs = this.auditLogService.auditLogs;
  readonly isLoading = this.auditLogService.isLoading;
  readonly error = this.auditLogService.error;

  // Stats Signal
  readonly stats = signal<{
    total: number;
    success: number;
    failure: number;
    successRate: number;
    topAction: string;
  } | null>(null);

  readonly workspaceId = signal<string | undefined>(undefined);

  // Table Filters
  readonly selectedAction = signal<AuditAction | null>(null);
  readonly selectedStatus = signal<AuditStatus | null>(null);

  readonly actionOptions = [
    { label: 'Crear Workspace', value: AuditAction.WORKSPACE_CREATE },
    { label: 'Actualizar Workspace', value: AuditAction.WORKSPACE_UPDATE },
    { label: 'Deshabilitar Workspace', value: AuditAction.WORKSPACE_DISABLE },
    { label: 'Guardar Token', value: AuditAction.TOKEN_SAVE },
    { label: 'Probar Conexión', value: AuditAction.TOKEN_TEST },
    { label: 'Sincronización Manual', value: AuditAction.SYNC_MANUAL },
    { label: 'Sincronización Programada', value: AuditAction.SYNC_SCHEDULED },
    { label: 'Generar Alertas', value: AuditAction.ALERT_GENERATE },
  ];

  readonly statusOptions = [
    { label: 'Éxito', value: AuditStatus.SUCCESS },
    { label: 'Fallo', value: AuditStatus.FAILED },
    { label: 'Parcial', value: AuditStatus.PARTIAL },
  ];

  ngOnInit(): void {
    // Check if workspace-specific route
    this.route.paramMap.subscribe((params) => {
      const id = params.get('workspaceId');
      if (id) {
        this.workspaceId.set(id);
      }
      this.loadData();
    });
  }

  /**
   * Load all data (logs + stats)
   */
  async loadData(): Promise<void> {
    try {
      const id = this.workspaceId();

      // Parallel loading
      const [logs, stats] = await Promise.all([
        id
          ? this.auditLogService.getWorkspaceAuditLogs(id)
          : this.auditLogService.getRecentAuditLogs(),
        this.auditLogService.getAuditStats(id),
      ]);

      // Process Stats
      const total = stats.total;
      const success = stats.success;
      const failure = stats.failure;
      const successRate = total > 0 ? (success / total) * 100 : 0;

      // Find top action
      let topAction = 'N/A';
      let maxCount = 0;
      for (const [action, count] of Object.entries(stats.byAction)) {
        if (count > maxCount) {
          maxCount = count;
          topAction = action;
        }
      }

      this.stats.set({
        total,
        success,
        failure,
        successRate,
        topAction: this.formatActionLabel(topAction),
      });
    } catch {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudieron cargar los datos de auditoría',
      });
    }
  }

  /**
   * Helper to format action label
   */
  formatActionLabel(action: string): string {
    const labels: Record<string, string> = {
      'workspace.create': 'Crear Workspace',
      'workspace.update': 'Actualizar Workspace',
      'workspace.disable': 'Deshabilitar Workspace',
      'workspace.delete': 'Eliminar Workspace',
      'token.save': 'Guardar Token',
      'token.test': 'Probar Conexión',
      'sync.manual': 'Sync Manual',
      'sync.scheduled': 'Sync Auto',
      'alert.generate': 'Generar Alertas',
      'dns.view': 'Ver DNS',
      'dns.validate': 'Validar DNS',
    };
    return labels[action] || action;
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

  getHealthSeverity(status: string): 'success' | 'warn' | 'danger' | 'info' | 'secondary' {
    switch (status) {
      case AuditStatus.SUCCESS:
        return 'success';
      case AuditStatus.PARTIAL:
        return 'warn';
      case AuditStatus.FAILED:
        return 'danger';
      default:
        return 'info';
    }
  }

  getStatusIcon(status: string): string {
    const icons: Record<string, string> = {
      success: 'fa fa-check-circle',
      failure: 'fa fa-times-circle',
      partial: 'fa fa-exclamation-circle',
    };
    return icons[status] || 'fa fa-info-circle';
  }
}
