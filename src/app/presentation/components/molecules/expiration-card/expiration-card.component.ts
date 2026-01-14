import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { CardModule } from 'primeng/card';
import { ChipModule } from 'primeng/chip';

/**
 * Expiration Card Component (Molecule)
 *
 * Displays expiration statistics for domains or subscriptions
 * grouped by time periods (7/15/30/60 days)
 */
@Component({
  selector: 'app-expiration-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CardModule, ChipModule],
  template: `
    <p-card class="expiration-card">
      <ng-template pTemplate="header">
        <div class="card-header-custom">
          <i [class]="icon()" class="card-icon"></i>
          <h3>{{ title() }}</h3>
        </div>
      </ng-template>

      <div class="expiration-content">
        <div class="expiration-row" [class.has-items]="count7Days() > 0">
          <span class="period-label">
            <i class="pi pi-clock"></i>
            7 días
          </span>
          <p-chip [label]="count7Days().toString()" [class]="getChipClass(count7Days(), '7d')" />
        </div>
        <div class="expiration-row" [class.has-items]="count15Days() > 0">
          <span class="period-label">
            <i class="pi pi-clock"></i>
            15 días
          </span>
          <p-chip [label]="count15Days().toString()" [class]="getChipClass(count15Days(), '15d')" />
        </div>
        <div class="expiration-row" [class.has-items]="count30Days() > 0">
          <span class="period-label">
            <i class="pi pi-clock"></i>
            30 días
          </span>
          <p-chip [label]="count30Days().toString()" [class]="getChipClass(count30Days(), '30d')" />
        </div>
        <div class="expiration-row" [class.has-items]="count60Days() > 0">
          <span class="period-label">
            <i class="pi pi-clock"></i>
            60 días
          </span>
          <p-chip [label]="count60Days().toString()" [class]="getChipClass(count60Days(), '60d')" />
        </div>
      </div>

      <ng-template pTemplate="footer">
        <div class="total-count">
          <i class="pi pi-list"></i>
          Total: <strong>{{ totalCount() }}</strong>
        </div>
      </ng-template>
    </p-card>
  `,
  styles: [
    `
      .expiration-card {
        height: 100%;
      }

      .card-header-custom {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 1.25rem;
        background: var(--surface-100);
      }

      .card-icon {
        font-size: 2rem;
        color: var(--primary-color);
      }

      .card-header-custom h3 {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--text-color);
      }

      .expiration-content {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        padding: 0.5rem 0;
      }

      .expiration-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.75rem 0;
        border-bottom: 1px solid var(--surface-200);
        transition: background-color 0.2s ease;
      }

      .expiration-row.has-items {
        background-color: var(--surface-50);
        padding: 0.75rem 1rem;
        margin: 0 -1rem;
        border-radius: 6px;
      }

      .expiration-row:last-child {
        border-bottom: none;
      }

      .period-label {
        font-weight: 500;
        color: var(--text-color-secondary);
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .period-label i {
        font-size: 0.9rem;
        color: var(--primary-color);
      }

      .total-count {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        justify-content: flex-end;
        font-size: 1.1rem;
        color: var(--text-color-secondary);
        padding-top: 0.5rem;
        border-top: 2px solid var(--surface-300);
      }

      .total-count i {
        color: var(--primary-color);
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

        .chip-zero {
          background-color: transparent !important;
          color: var(--text-color) !important;
          border: 2px dashed var(--surface-400);
          font-weight: 600;
          opacity: 0.8;
        }
      }
    `,
  ],
})
export class ExpirationCardComponent {
  readonly title = input.required<string>();
  readonly icon = input.required<string>();
  readonly count7Days = input.required<number>();
  readonly count15Days = input.required<number>();
  readonly count30Days = input.required<number>();
  readonly count60Days = input.required<number>();
  readonly totalCount = input.required<number>();

  /**
   * Get chip class based on count and period
   * - 7d: critical (red) - most urgent
   * - 15d: warning (orange) - needs attention
   * - 30d: info (blue) - moderate urgency
   * - 60d: success (green) - least urgent
   * - 0: zero (outlined) - no items
   */
  getChipClass(count: number | undefined, period: '7d' | '15d' | '30d' | '60d'): string {
    // Zero count - show as outlined/muted
    if (!count || count === 0) {
      return 'chip-zero';
    }

    // Period-based colors for better visibility
    switch (period) {
      case '7d':
        return 'chip-critical'; // Red - most urgent
      case '15d':
        return 'chip-warning'; // Orange - needs attention
      case '30d':
        return 'chip-info'; // Blue - moderate
      case '60d':
        return 'chip-success'; // Green - least urgent
      default:
        return 'chip-info';
    }
  }
}
