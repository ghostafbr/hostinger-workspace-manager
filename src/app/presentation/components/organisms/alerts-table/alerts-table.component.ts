import { Component, ChangeDetectionStrategy, input, output, signal } from '@angular/core';
import { TableModule } from 'primeng/table';
import { SelectModule } from 'primeng/select';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertLogModel, EntityType } from '@app/domain';
import { TableToolbarComponent } from '../../molecules/table-toolbar/table-toolbar.component';
import { SearchInputComponent } from '../../molecules/search-input/search-input.component';
import { StatusTagComponent } from '../../atoms/status-tag/status-tag.component';
import { ActionButtonComponent } from '../../atoms/action-button/action-button.component';
import { EmptyStateComponent } from '../../molecules/empty-state/empty-state.component';

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
    SelectModule,
    DatePipe,
    FormsModule,
    TableToolbarComponent,
    SearchInputComponent,
    StatusTagComponent,
    ActionButtonComponent,
    EmptyStateComponent,
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
      class="p-datatable-sm"
      [rowHover]="true"
      #dt
    >
      <!-- Caption -->
      <ng-template pTemplate="caption">
        <app-table-toolbar title="Alertas" icon="pi pi-bell" [count]="alerts().length">
          <!-- Search -->
          <app-search-input (onInput)="dt.filterGlobal($event, 'contains')" />

          <!-- Entity Type Filter -->
          <p-select
            [options]="entityTypeOptions"
            [(ngModel)]="selectedEntityType"
            (onChange)="onEntityTypeFilter($event)"
            placeholder="Todos los tipos"
            [showClear]="true"
            class="w-full sm:w-auto"
          />

          <!-- Days Before Filter -->
          <p-select
            [options]="daysBeforeOptions"
            [(ngModel)]="selectedDaysBefore"
            (onChange)="onDaysBeforeFilter($event)"
            placeholder="Todos los días"
            [showClear]="true"
            class="w-full sm:w-auto"
          />
        </app-table-toolbar>
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
            <app-status-tag
              [value]="alert.getEntityTypeLabel()"
              [severityOverride]="alert.entityType === 'domain' ? 'info' : 'success'"
              [icon]="alert.entityType === 'domain' ? 'pi pi-globe' : 'pi pi-shopping-cart'"
            />
          </td>

          <!-- Entity Name -->
          <td>
            <strong>{{ alert.entityName }}</strong>
          </td>

          <!-- Days Before -->
          <td style="text-align: center">
            <app-status-tag
              [value]="alert.getDaysBeforeLabel()"
              [severityOverride]="getDaysBeforeSeverity(alert.daysBefore)"
              [rounded]="true"
            />
          </td>

          <!-- Expires At -->
          <td>
            <i class="pi pi-clock mr-2"></i>
            {{ alert.expiresAt.toDate() | date: 'dd/MM/yyyy' }}
          </td>

          <!-- Severity -->
          <td style="text-align: center">
            <app-status-tag
              [value]="getSeverityLabel(alert.getSeverity())"
              [severityOverride]="alert.getSeverity()"
              [icon]="getSeverityIcon(alert.getSeverity())"
            />
          </td>

          <!-- Actions -->
          <td style="text-align: center">
            <app-action-button
              action="view"
              tooltip="Ver detalles"
              (onClick)="viewDetails.emit(alert)"
            />
          </td>
        </tr>
      </ng-template>

      <!-- Empty State -->
      <ng-template pTemplate="emptymessage">
        <tr>
          <td colspan="7">
            <app-empty-state title="No se encontraron alertas" />
          </td>
        </tr>
      </ng-template>
    </p-table>
  `,
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
  }

  onDaysBeforeFilter(event: { value: number | null }): void {
    this.selectedDaysBefore.set(event.value);
  }

  getDaysBeforeSeverity(daysBefore: number): 'danger' | 'warn' | 'info' | 'success' {
    if (daysBefore <= 3) return 'danger';
    if (daysBefore <= 7) return 'warn';
    if (daysBefore <= 30) return 'info';
    return 'success';
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
