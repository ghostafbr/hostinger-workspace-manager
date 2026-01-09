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
import { AlertLogModel, EntityType } from '@app/domain';

/**
 * Alerts Table Component
 *
 * Displays alert logs in a filterable table
 */
@Component({
  selector: 'app-alerts-table',
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
      [value]="alerts()"
      [loading]="isLoading()"
      [paginator]="true"
      [rows]="10"
      [rowsPerPageOptions]="[10, 25, 50]"
      [globalFilterFields]="['entityName', 'entityType']"
      [tableStyle]="{ 'min-width': '60rem' }"
      styleClass="p-datatable-sm"
      [rowHover]="true"
      #dt
    >
      <!-- Caption -->
      <ng-template pTemplate="caption">
        <div class="table-header">
          <div class="header-left">
            <h2><i class="pi pi-bell"></i> Alertas</h2>
            <p-chip
              [label]="alerts().length.toString()"
              styleClass="ml-2"
            />
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

            <!-- Entity Type Filter -->
            <p-select
              [options]="entityTypeOptions"
              [(ngModel)]="selectedEntityType"
              (onChange)="onEntityTypeFilter($event)"
              placeholder="Todos los tipos"
              [showClear]="true"
              styleClass="ml-2"
            />

            <!-- Days Before Filter -->
            <p-select
              [options]="daysBeforeOptions"
              [(ngModel)]="selectedDaysBefore"
              (onChange)="onDaysBeforeFilter($event)"
              placeholder="Todos los días"
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
          <th pSortableColumn="entityType">
            Tipo
            <p-sortIcon field="entityType" />
          </th>
          <th pSortableColumn="entityName">
            Entidad
            <p-sortIcon field="entityName" />
          </th>
          <th pSortableColumn="daysBefore" style="text-align: center">
            Días Restantes
            <p-sortIcon field="daysBefore" />
          </th>
          <th pSortableColumn="expiresAt">
            Vence
            <p-sortIcon field="expiresAt" />
          </th>
          <th style="text-align: center">Severidad</th>
          <th style="text-align: center">Acciones</th>
        </tr>
      </ng-template>

      <!-- Body -->
      <ng-template pTemplate="body" let-alert>
        <tr>
          <!-- Created At -->
          <td>
            <i class="pi pi-calendar mr-2"></i>
            {{ alert.createdAt.toDate() | date: 'dd/MM/yyyy HH:mm' }}
          </td>

          <!-- Entity Type -->
          <td>
            <p-tag
              [value]="alert.getEntityTypeLabel()"
              [severity]="alert.entityType === 'domain' ? 'info' : 'success'"
              [icon]="alert.entityType === 'domain' ? 'pi pi-globe' : 'pi pi-shopping-cart'"
            />
          </td>

          <!-- Entity Name -->
          <td>
            <strong>{{ alert.entityName }}</strong>
          </td>

          <!-- Days Before -->
          <td style="text-align: center">
            <p-chip
              [label]="alert.getDaysBeforeLabel()"
              [styleClass]="getDaysBeforeChipClass(alert.daysBefore)"
            />
          </td>

          <!-- Expires At -->
          <td>
            <i class="pi pi-clock mr-2"></i>
            {{ alert.expiresAt.toDate() | date: 'dd/MM/yyyy' }}
          </td>

          <!-- Severity -->
          <td style="text-align: center">
            <p-tag
              [value]="getSeverityLabel(alert.getSeverity())"
              [severity]="alert.getSeverity()"
              [icon]="getSeverityIcon(alert.getSeverity())"
            />
          </td>

          <!-- Actions -->
          <td style="text-align: center">
            <p-button
              icon="pi pi-eye"
              [rounded]="true"
              [text]="true"
              severity="secondary"
              (onClick)="viewDetails.emit(alert)"
              pTooltip="Ver detalles"
            />
          </td>
        </tr>
      </ng-template>

      <!-- Empty State -->
      <ng-template pTemplate="emptymessage">
        <tr>
          <td colspan="7" style="text-align: center; padding: 3rem">
            <i class="pi pi-inbox" style="font-size: 3rem; color: var(--text-color-secondary)"></i>
            <p style="margin-top: 1rem; color: var(--text-color-secondary)">
              No se encontraron alertas
            </p>
          </td>
        </tr>
      </ng-template>
    </p-table>
  `,
  styles: [`
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

    :host ::ng-deep {
      .chip-critical {
        background-color: var(--red-600) !important;
        color: white !important;
        font-weight: 600;
        border: 2px solid var(--red-700);
      }

      .chip-warning {
        background-color: var(--orange-600) !important;
        color: white !important;
        font-weight: 600;
        border: 2px solid var(--orange-700);
      }

      .chip-info {
        background-color: var(--blue-600) !important;
        color: white !important;
        font-weight: 600;
        border: 2px solid var(--blue-700);
      }

      .chip-success {
        background-color: var(--green-600) !important;
        color: white !important;
        font-weight: 600;
        border: 2px solid var(--green-700);
      }
    }
  `],
})
export class AlertsTableComponent {
  readonly alerts = input.required<AlertLogModel[]>();
  readonly isLoading = input<boolean>(false);
  readonly viewDetails = output<AlertLogModel>();

  readonly selectedEntityType = signal<EntityType | null>(null);
  readonly selectedDaysBefore = signal<number | null>(null);

  readonly entityTypeOptions = [
    { label: 'Dominios', value: EntityType.DOMAIN },
    { label: 'Suscripciones', value: EntityType.SUBSCRIPTION },
  ];

  readonly daysBeforeOptions = [
    { label: '1 día', value: 1 },
    { label: '3 días', value: 3 },
    { label: '7 días', value: 7 },
    { label: '15 días', value: 15 },
    { label: '30 días', value: 30 },
    { label: '45 días', value: 45 },
  ];

  onEntityTypeFilter(event: { value: EntityType | null }): void {
    this.selectedEntityType.set(event.value);
    // Emit filter change if needed
  }

  onDaysBeforeFilter(event: { value: number | null }): void {
    this.selectedDaysBefore.set(event.value);
    // Emit filter change if needed
  }

  getDaysBeforeChipClass(daysBefore: number): string {
    if (daysBefore <= 3) return 'chip-critical';
    if (daysBefore <= 7) return 'chip-warning';
    if (daysBefore <= 30) return 'chip-info';
    return 'chip-success';
  }

  getSeverityLabel(severity: string): string {
    const labels: Record<string, string> = {
      danger: 'Crítico',
      warn: 'Advertencia',
      info: 'Información',
      success: 'Normal',
    };
    return labels[severity] || severity;
  }

  getSeverityIcon(severity: string): string {
    const icons: Record<string, string> = {
      danger: 'pi pi-exclamation-triangle',
      warn: 'pi pi-exclamation-circle',
      info: 'pi pi-info-circle',
      success: 'pi pi-check-circle',
    };
    return icons[severity] || 'pi pi-info-circle';
  }
}
