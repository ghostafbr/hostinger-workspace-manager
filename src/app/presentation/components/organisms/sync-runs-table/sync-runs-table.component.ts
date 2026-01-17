import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { TableModule } from 'primeng/table';
import { ChipModule } from 'primeng/chip';
import { ProgressBarModule } from 'primeng/progressbar';
import { DatePipe } from '@angular/common';
import { SyncRun } from '@app/domain';
import { TableToolbarComponent } from '../../molecules/table-toolbar/table-toolbar.component';
import { SearchInputComponent } from '../../molecules/search-input/search-input.component';
import { StatusTagComponent } from '../../atoms/status-tag/status-tag.component';
import { ActionButtonComponent } from '../../atoms/action-button/action-button.component';
import { EmptyStateComponent } from '../../molecules/empty-state/empty-state.component';

/**
 * Sync Runs Table Component
 *
 * Displays sync run history in a table
 */
@Component({
  selector: 'app-sync-runs-table',

  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TableModule,
    ChipModule,
    ProgressBarModule,
    DatePipe,
    TableToolbarComponent,
    SearchInputComponent,
    StatusTagComponent,
    ActionButtonComponent,
    EmptyStateComponent,
  ],
  template: `
    <p-table
      [value]="syncRuns()"
      [loading]="isLoading()"
      [paginator]="true"
      [rows]="10"
      [rowsPerPageOptions]="[10, 25, 50]"
      [tableStyle]="{ 'min-width': '70rem' }"
      class="p-datatable-sm"
      [rowHover]="true"
      #dt
    >
      <!-- Caption -->
      <ng-template pTemplate="caption">
        <app-table-toolbar
          title="Historial de Sincronizaciones"
          icon="pi pi-sync"
          [count]="syncRuns().length"
        >
          <!-- Search -->
          <app-search-input (onInput)="dt.filterGlobal($event, 'contains')" />
        </app-table-toolbar>
      </ng-template>

      <!-- Header -->
      <ng-template pTemplate="header">
        <tr>
          <th pSortableColumn="startedAt">
            Inicio
            <p-sortIcon field="startedAt" />
          </th>
          <th>Duración</th>
          <th style="text-align: center">Dominios</th>
          <th style="text-align: center">Suscripciones</th>
          <th style="text-align: center">Estado</th>
          <th>Errores</th>
          <th style="text-align: center">Acciones</th>
        </tr>
      </ng-template>

      <!-- Body -->
      <ng-template pTemplate="body" let-run>
        <tr>
          <!-- Started At -->
          <td>
            <i class="pi pi-calendar mr-2"></i>
            {{ run.startedAt.toDate() | date: 'dd/MM/yyyy HH:mm:ss' }}
          </td>

          <!-- Duration -->
          <td>
            @if (run.getDuration()) {
              <p-chip [label]="formatDuration(run.getDuration()!)" class="duration-chip" />
            } @else {
              <span class="text-muted">En progreso...</span>
            }
          </td>

          <!-- Domains Processed -->
          <td style="text-align: center">
            <p-chip
              [label]="(run.domainsProcessed || 0).toString()"
              class="count-chip"
              icon="pi pi-globe"
            />
          </td>

          <!-- Subscriptions Processed -->
          <td style="text-align: center">
            <p-chip
              [label]="(run.subscriptionsProcessed || 0).toString()"
              class="count-chip"
              icon="pi pi-shopping-cart"
            />
          </td>

          <!-- Status -->
          <td style="text-align: center">
            <app-status-tag
              [value]="run.getStatusLabel()"
              [severityOverride]="run.getSeverity()"
              [icon]="getStatusIcon(run)"
            />
          </td>

          <!-- Errors -->
          <td>
            @if (run.errors && run.errors.length > 0) {
              <app-action-button
                action="custom"
                customIcon="pi pi-exclamation-triangle"
                [tooltip]="run.errors.length + ' errores'"
                (onClick)="viewErrors.emit(run)"
              />
            } @else {
              <span class="text-success">
                <i class="pi pi-check-circle mr-1"></i>
                Sin errores
              </span>
            }
          </td>

          <!-- Actions -->
          <td style="text-align: center">
            <app-action-button
              action="view"
              tooltip="Ver detalles"
              (onClick)="viewDetails.emit(run)"
            />
          </td>
        </tr>
      </ng-template>

      <!-- Empty State -->
      <ng-template pTemplate="emptymessage">
        <tr>
          <td colspan="7">
            <app-empty-state title="No se encontraron sincronizaciones" />
          </td>
        </tr>
      </ng-template>
    </p-table>
  `,
  styles: [
    `
      .duration-chip {
        background-color: var(--blue-100);
        color: var(--blue-900);
      }

      .count-chip {
        background-color: var(--surface-200);
        color: var(--text-color);
      }

      .text-muted {
        color: var(--text-color-secondary);
        font-style: italic;
      }

      .text-success {
        color: var(--green-600);
      }
    `,
  ],
})
export class SyncRunsTableComponent {
  readonly syncRuns = input.required<SyncRun[]>();
  readonly isLoading = input<boolean>(false);
  readonly viewDetails = output<SyncRun>();
  readonly viewErrors = output<SyncRun>();

  formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  }

  getStatusIcon(run: SyncRun): string {
    if (run.isSuccess()) return 'pi pi-check-circle';
    if (run.isFailed()) return 'pi pi-times-circle';
    if (run.isPartialSuccess && run.isPartialSuccess()) return 'pi pi-exclamation-circle';
    return 'pi pi-info-circle';
  }
}
