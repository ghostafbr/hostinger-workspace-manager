import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
} from '@angular/core';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ChipModule } from 'primeng/chip';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressBarModule } from 'primeng/progressbar';
import { DatePipe } from '@angular/common';
import { SyncRun } from '@app/domain';

/**
 * Sync Runs Table Component
 *
 * Displays sync run history in a table
 */
@Component({
  selector: 'app-sync-runs-table',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TableModule,
    ButtonModule,
    ChipModule,
    TagModule,
    TooltipModule,
    InputTextModule,
    ProgressBarModule,
    DatePipe,
  ],
  template: `
    <p-table
      [value]="syncRuns()"
      [loading]="isLoading()"
      [paginator]="true"
      [rows]="10"
      [rowsPerPageOptions]="[10, 25, 50]"
      [tableStyle]="{ 'min-width': '70rem' }"
      styleClass="p-datatable-sm"
      [rowHover]="true"
      #dt
    >
      <!-- Caption -->
      <ng-template pTemplate="caption">
        <div class="table-header">
          <div class="header-left">
            <h2><i class="pi pi-sync"></i> Historial de Sincronizaciones</h2>
            <p-chip [label]="syncRuns().length.toString()" styleClass="ml-2" />
          </div>
          <div class="header-right">
            <span class="p-input-icon-left">
              <i class="pi pi-search"></i>
              <input
                pInputText
                type="text"
                (input)="dt.filterGlobal($any($event.target).value, 'contains')"
                placeholder="Buscar..."
              />
            </span>
          </div>
        </div>
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
              <p-chip
                [label]="formatDuration(run.getDuration()!)"
                styleClass="duration-chip"
              />
            } @else {
              <span class="text-muted">En progreso...</span>
            }
          </td>

          <!-- Domains Processed -->
          <td style="text-align: center">
            <p-chip
              [label]="(run.domainsProcessed || 0).toString()"
              styleClass="count-chip"
              icon="pi pi-globe"
            />
          </td>

          <!-- Subscriptions Processed -->
          <td style="text-align: center">
            <p-chip
              [label]="(run.subscriptionsProcessed || 0).toString()"
              styleClass="count-chip"
              icon="pi pi-shopping-cart"
            />
          </td>

          <!-- Status -->
          <td style="text-align: center">
            <p-tag
              [value]="run.getStatusLabel()"
              [severity]="run.getSeverity()"
              [icon]="getStatusIcon(run)"
            />
          </td>

          <!-- Errors -->
          <td>
            @if (run.errors && run.errors.length > 0) {
              <p-button
                [label]="run.errors.length + ' error(es)'"
                icon="pi pi-exclamation-triangle"
                severity="danger"
                [text]="true"
                [size]="'small'"
                (onClick)="viewErrors.emit(run)"
                pTooltip="Ver errores"
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
            <p-button
              icon="pi pi-eye"
              [rounded]="true"
              [text]="true"
              severity="secondary"
              (onClick)="viewDetails.emit(run)"
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
              No se encontraron sincronizaciones
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
