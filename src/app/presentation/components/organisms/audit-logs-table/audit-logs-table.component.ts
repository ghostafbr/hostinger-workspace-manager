import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  signal,
} from '@angular/core';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ChipModule } from 'primeng/chip';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuditLogModel, AuditAction, AuditStatus } from '@app/domain';

/**
 * Audit Logs Table Component
 *
 * Displays audit logs in a filterable table
 */
@Component({
  selector: 'app-audit-logs-table',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TableModule,
    ButtonModule,
    ChipModule,
    TagModule,
    TooltipModule,
    InputTextModule,
    SelectModule,
    DatePipe,
    FormsModule,
  ],
  template: `
    <p-table
      [value]="auditLogs()"
      [loading]="isLoading()"
      [paginator]="true"
      [rows]="10"
      [rowsPerPageOptions]="[10, 25, 50, 100]"
      [globalFilterFields]="['action', 'actorEmail', 'workspaceId']"
      [tableStyle]="{ 'min-width': '70rem' }"
      styleClass="p-datatable-sm"
      [rowHover]="true"
      #dt
    >
      <!-- Caption -->
      <ng-template pTemplate="caption">
        <div class="table-header">
          <div class="header-left">
            <h2><i class="pi pi-file"></i> Audit Logs</h2>
            <p-chip [label]="auditLogs().length.toString()" styleClass="ml-2" />
          </div>
          <div class="header-right">
            <!-- Search -->
            <span class="p-input-icon-left">
              <i class="pi pi-search"></i>
              <input
                pInputText
                type="text"
                (input)="dt.filterGlobal($any($event.target).value, 'contains')"
                placeholder="Buscar..."
              />
            </span>

            <!-- Action Filter -->
            <p-select
              [options]="actionOptions"
              [(ngModel)]="selectedAction"
              (onChange)="onActionFilter($event)"
              placeholder="Todas las acciones"
              [showClear]="true"
              styleClass="ml-2"
            />

            <!-- Status Filter -->
            <p-select
              [options]="statusOptions"
              [(ngModel)]="selectedStatus"
              (onChange)="onStatusFilter($event)"
              placeholder="Todos los estados"
              [showClear]="true"
              styleClass="ml-2"
            />
          </div>
        </div>
      </ng-template>

      <!-- Header -->
      <ng-template pTemplate="header">
        <tr>
          <th pSortableColumn="createdAt">
            Fecha
            <p-sortIcon field="createdAt" />
          </th>
          <th pSortableColumn="action">
            Acción
            <p-sortIcon field="action" />
          </th>
          <th pSortableColumn="actorEmail">
            Usuario
            <p-sortIcon field="actorEmail" />
          </th>
          <th pSortableColumn="workspaceId">Workspace</th>
          <th style="text-align: center">Estado</th>
          <th style="text-align: center">Acciones</th>
        </tr>
      </ng-template>

      <!-- Body -->
      <ng-template pTemplate="body" let-log>
        <tr>
          <!-- Created At -->
          <td>
            <i class="pi pi-calendar mr-2"></i>
            {{ log.createdAt.toDate() | date: 'dd/MM/yyyy HH:mm:ss' }}
          </td>

          <!-- Action -->
          <td>
            <div class="action-cell">
              <i [class]="log.getActionIcon()" class="mr-2"></i>
              <span>{{ log.getActionLabel() }}</span>
            </div>
          </td>

          <!-- Actor -->
          <td>
            <div class="actor-cell">
              <i class="pi pi-user mr-2"></i>
              {{ log.actorEmail || log.actorUid }}
            </div>
          </td>

          <!-- Workspace -->
          <td>
            @if (log.workspaceId) {
              <p-chip [label]="log.workspaceId" styleClass="workspace-chip" />
            } @else {
              <span class="text-muted">Sistema</span>
            }
          </td>

          <!-- Status -->
          <td style="text-align: center">
            <p-tag
              [value]="log.getStatusLabel()"
              [severity]="log.getSeverity()"
              [icon]="getStatusIcon(log.status)"
            />
          </td>

          <!-- Actions -->
          <td style="text-align: center">
            <p-button
              icon="pi pi-eye"
              [rounded]="true"
              [text]="true"
              severity="secondary"
              (onClick)="viewDetails.emit(log)"
              pTooltip="Ver detalles"
            />
          </td>
        </tr>
      </ng-template>

      <!-- Empty State -->
      <ng-template pTemplate="emptymessage">
        <tr>
          <td colspan="6" style="text-align: center; padding: 3rem">
            <i class="pi pi-inbox" style="font-size: 3rem; color: var(--text-color-secondary)"></i>
            <p style="margin-top: 1rem; color: var(--text-color-secondary)">
              No se encontraron registros de auditoría
            </p>
          </td>
        </tr>
      </ng-template>
    </p-table>
  `,
  styles: [
    `
      .table-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
        background: var(--surface-100);
        border-radius: 8px;
        margin-bottom: 1rem;
      }

      .header-left {
        display: flex;
        align-items: center;
        gap: 0.5rem;

        h2 {
          margin: 0;
          font-size: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;

          i {
            color: var(--primary-color);
          }
        }
      }

      .header-right {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .action-cell,
      .actor-cell {
        display: flex;
        align-items: center;
      }

      .workspace-chip {
        font-size: 0.875rem;
      }

      .text-muted {
        color: var(--text-color-secondary);
        font-style: italic;
      }
    `,
  ],
})
export class AuditLogsTableComponent {
  readonly auditLogs = input.required<AuditLogModel[]>();
  readonly isLoading = input<boolean>(false);
  readonly viewDetails = output<AuditLogModel>();

  readonly selectedAction = signal<AuditAction | null>(null);
  readonly selectedStatus = signal<AuditStatus | null>(null);

  readonly actionOptions = [
    { label: 'Crear Workspace', value: AuditAction.workspaceCreate },
    { label: 'Actualizar Workspace', value: AuditAction.workspaceUpdate },
    { label: 'Deshabilitar Workspace', value: AuditAction.workspaceDisable },
    { label: 'Guardar Token', value: AuditAction.tokenSave },
    { label: 'Probar Conexión', value: AuditAction.tokenTest },
    { label: 'Sincronización Manual', value: AuditAction.syncManual },
    { label: 'Sincronización Programada', value: AuditAction.syncScheduled },
    { label: 'Generar Alertas', value: AuditAction.alertGenerate },
  ];

  readonly statusOptions = [
    { label: 'Éxito', value: AuditStatus.success },
    { label: 'Fallo', value: AuditStatus.failed },
    { label: 'Parcial', value: AuditStatus.partial },
  ];

  onActionFilter(event: { value: AuditAction | null }): void {
    this.selectedAction.set(event.value);
  }

  onStatusFilter(event: { value: AuditStatus | null }): void {
    this.selectedStatus.set(event.value);
  }

  getStatusIcon(status: AuditStatus): string {
    const icons: Record<string, string> = {
      success: 'pi pi-check-circle',
      failure: 'pi pi-times-circle',
      partial: 'pi pi-exclamation-circle',
    };
    return icons[status] || 'pi pi-info-circle';
  }
}
