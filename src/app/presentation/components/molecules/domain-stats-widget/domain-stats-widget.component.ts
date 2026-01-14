import { Component, ChangeDetectionStrategy, input } from '@angular/core';

// PrimeNG
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { DecimalPipe } from '@angular/common';

export interface DomainStats {
  total: number;
  expired: number;
  critical: number;
  warning: number;
  active: number;
  totalValue: number;
}

/**
 * Domain Statistics Widget
 *
 * Shows overview of domain status statistics
 */
@Component({
  selector: 'app-domain-stats-widget',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CardModule, TagModule, SkeletonModule, DecimalPipe],
  template: `
    <p-card>
      <ng-template pTemplate="header">
        <div class="card-header">
          <h3><i class="pi pi-globe"></i> Estadísticas de Dominios</h3>
        </div>
      </ng-template>

      @if (isLoading()) {
        <div class="stats-grid">
          @for (item of [1, 2, 3, 4, 5]; track item) {
            <p-skeleton height="80px" />
          }
        </div>
      } @else if (stats()) {
        <div class="stats-grid">
          <div class="stat-item">
            <i class="pi pi-list stat-icon"></i>
            <div class="stat-content">
              <span class="stat-value">{{ stats()!.total }}</span>
              <span class="stat-label">Total</span>
            </div>
          </div>

          <div class="stat-item expired">
            <i class="pi pi-times-circle stat-icon"></i>
            <div class="stat-content">
              <span class="stat-value">{{ stats()!.expired }}</span>
              <span class="stat-label">Expirados</span>
            </div>
          </div>

          <div class="stat-item critical">
            <i class="pi pi-exclamation-triangle stat-icon"></i>
            <div class="stat-content">
              <span class="stat-value">{{ stats()!.critical }}</span>
              <span class="stat-label">Críticos (&lt; 7d)</span>
            </div>
          </div>

          <div class="stat-item warning">
            <i class="pi pi-info-circle stat-icon"></i>
            <div class="stat-content">
              <span class="stat-value">{{ stats()!.warning }}</span>
              <span class="stat-label">Advertencia (&lt; 30d)</span>
            </div>
          </div>

          <div class="stat-item active">
            <i class="pi pi-check-circle stat-icon"></i>
            <div class="stat-content">
              <span class="stat-value">{{ stats()!.active }}</span>
              <span class="stat-label">Activos</span>
            </div>
          </div>

          <div class="stat-item value">
            <i class="pi pi-dollar stat-icon"></i>
            <div class="stat-content">
              <span class="stat-value">{{ stats()!.totalValue | number: '1.0-0' : 'es-CO' }}</span>
              <span class="stat-label">Valor Total (COP)</span>
            </div>
          </div>
        </div>
      }
    </p-card>
  `,
  styles: [
    `
      .card-header {
        padding: 1rem 1.5rem;

        h3 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.5rem;

          i {
            color: var(--primary-color);
          }
        }
      }

      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 1rem;
        padding: 0.5rem;
      }

      .stat-item {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem;
        border-radius: var(--border-radius);
        background: var(--surface-50);
        border: 1px solid var(--surface-200);
        transition: all 0.3s ease;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .stat-icon {
          font-size: 2rem;
          opacity: 0.7;
        }

        .stat-content {
          display: flex;
          flex-direction: column;

          .stat-value {
            font-size: 1.75rem;
            font-weight: 700;
            line-height: 1;
            margin-bottom: 0.25rem;
          }

          .stat-label {
            font-size: 0.875rem;
            color: var(--text-color-secondary);
          }
        }

        &.expired {
          background: rgba(239, 68, 68, 0.1);
          border-color: rgba(239, 68, 68, 0.3);

          .stat-icon,
          .stat-value {
            color: #ef4444;
          }
        }

        &.critical {
          background: rgba(245, 158, 11, 0.1);
          border-color: rgba(245, 158, 11, 0.3);

          .stat-icon,
          .stat-value {
            color: #f59e0b;
          }
        }

        &.warning {
          background: rgba(59, 130, 246, 0.1);
          border-color: rgba(59, 130, 246, 0.3);

          .stat-icon,
          .stat-value {
            color: #3b82f6;
          }
        }

        &.active {
          background: rgba(34, 197, 94, 0.1);
          border-color: rgba(34, 197, 94, 0.3);

          .stat-icon,
          .stat-value {
            color: #22c55e;
          }
        }

        &.value {
          background: rgba(168, 85, 247, 0.1);
          border-color: rgba(168, 85, 247, 0.3);

          .stat-icon,
          .stat-value {
            color: #a855f7;
          }
        }
      }
    `,
  ],
})
export class DomainStatsWidgetComponent {
  readonly stats = input<DomainStats | null>();
  readonly isLoading = input<boolean>(false);
}
