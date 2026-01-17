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

      <div class="grid-content">
        <!-- 7 Days -->
        <div
          class="stat-tile"
          [class.active]="count7Days() > 0"
          [class.critical]="count7Days() > 0"
        >
          <span class="tile-label">7d</span>
          <span class="tile-value">{{ count7Days() }}</span>
        </div>

        <!-- 15 Days -->
        <div
          class="stat-tile"
          [class.active]="count15Days() > 0"
          [class.warning]="count15Days() > 0"
        >
          <span class="tile-label">15d</span>
          <span class="tile-value">{{ count15Days() }}</span>
        </div>

        <!-- 30 Days -->
        <div class="stat-tile" [class.active]="count30Days() > 0" [class.info]="count30Days() > 0">
          <span class="tile-label">30d</span>
          <span class="tile-value">{{ count30Days() }}</span>
        </div>

        <!-- 60 Days -->
        <div
          class="stat-tile"
          [class.active]="count60Days() > 0"
          [class.success]="count60Days() > 0"
        >
          <span class="tile-label">60d</span>
          <span class="tile-value">{{ count60Days() }}</span>
        </div>
      </div>

      <div class="card-footer">
        <div class="separator"></div>
        <div class="total-count">
          <span class="total-label">Total</span>
          <strong>{{ totalCount() }}</strong>
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
        gap: 0.75rem;
        margin-bottom: 1rem;
        padding-bottom: 0.75rem;
        border-bottom: 1px solid rgba(229, 231, 235, 0.4);
      }

      .header-icon-wrapper {
        width: 2rem;
        height: 2rem;
        border-radius: 10px;
        background: rgba(var(--primary-500-rgb), 0.08);
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .card-icon {
        font-size: 1rem;
        color: var(--primary-color);
      }

      .card-header-custom h3 {
        margin: 0;
        font-size: 1rem;
        font-weight: 600;
      }

      // 2x2 Grid
      .grid-content {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.75rem;
        flex: 1;
        margin-bottom: 1rem;
      }

      .stat-tile {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 0.75rem;
        background: var(--surface-50);
        border-radius: 12px;
        border: 1px solid transparent;
        transition: all 0.2s ease;

        // Default (Empty) state
        .tile-label {
          font-size: 0.75rem;
          color: var(--text-secondary);
          font-weight: 600; // Increased weight
          margin-bottom: 0.25rem;
        }

        .tile-value {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-main); // Use main text color
          opacity: 1; // Removed opacity
        }

        // Active States
        &.active {
          background: white;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

          .tile-value {
            opacity: 1;
            color: var(--primary-color); // Active items use primary color
          }
        }

        &.critical {
          background: #fef2f2; // Red 50
          border-color: #fee2e2;
          .tile-value {
            color: #dc2626;
          }
          .tile-label {
            color: #991b1b;
          }
        }

        &.warning {
          background: #fffbeb; // Amber 50
          border-color: #fef3c7;
          .tile-value {
            color: #d97706;
          }
          .tile-label {
            color: #92400e;
          }
        }

        &.info {
          background: #eff6ff; // Blue 50
          border-color: #dbeafe;
          .tile-value {
            color: #2563eb;
          }
          .tile-label {
            color: #1e40af;
          }
        }

        &.success {
          background: #ecfdf5; // Emerald 50
          border-color: #d1fae5;
          .tile-value {
            color: #059669;
          }
          .tile-label {
            color: #065f46;
          }
        }
      }

      .card-footer {
        margin-top: auto;
      }

      .separator {
        height: 1px;
        background: rgba(229, 231, 235, 0.4);
        margin-bottom: 0.75rem;
      }

      .total-count {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 0.875rem;
        color: var(--text-color-secondary);
      }

      .total-label {
        font-weight: 500;
      }

      .total-count strong {
        color: var(--text-color);
        font-size: 1rem;
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
