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
    <div class="expiration-container">
      <div class="card-header-custom">
        <div class="header-icon-wrapper">
           <i [class]="icon()" class="card-icon"></i>
        </div>
        <h3>{{ title() }}</h3>
      </div>

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

      <div class="card-footer">
        <div class="separator"></div>
        <div class="total-count">
          <i class="pi pi-list"></i>
          Total: <strong>{{ totalCount() }}</strong>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .expiration-container {
        display: flex;
        flex-direction: column;
        height: 100%;
      }

      .card-header-custom {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 1.5rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid rgba(229, 231, 235, 0.6);
      }
      
      .header-icon-wrapper {
        width: 2.5rem;
        height: 2.5rem;
        border-radius: 12px;
        background: rgba(var(--primary-500-rgb), 0.1);
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .card-icon {
        font-size: 1.25rem;
        color: var(--primary-color);
      }

      .card-header-custom h3 {
        margin: 0;
        font-size: 1.1rem;
        font-weight: 600;
        color: var(--text-color);
      }

      .expiration-content {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        margin-bottom: 1rem;
        flex: 1;
      }

      .expiration-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.5rem 0.75rem;
        border-radius: 8px;
        transition: background-color 0.2s ease;
        
        &:hover {
             background-color: var(--surface-50);
        }
      }

      .expiration-row.has-items {
        background-color: rgba(var(--primary-500-rgb), 0.05);
      }

      .period-label {
        font-weight: 500;
        font-size: 0.95rem;
        color: var(--text-color-secondary);
        display: flex;
        align-items: center;
        gap: 0.75rem;
        
        i {
            font-size: 0.9rem;
            color: var(--text-color-secondary);
            opacity: 0.7;
        }
      }

      .card-footer {
         margin-top: auto;
      }
      
      .separator {
        height: 1px;
        background: rgba(229, 231, 235, 0.6);
        margin-bottom: 1rem;
      }

      .total-count {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        justify-content: flex-end;
        font-size: 1rem;
        color: var(--text-color-secondary);
      }

      .total-count i {
        color: var(--primary-color);
        font-size: 1rem;
      }
      
      .total-count strong {
         color: var(--text-color);
         font-size: 1.1rem;
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
