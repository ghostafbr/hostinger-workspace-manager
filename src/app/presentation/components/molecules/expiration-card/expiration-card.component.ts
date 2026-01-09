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
    <p-card styleClass="expiration-card">
      <ng-template pTemplate="header">
        <div class="card-header-custom">
          <i [class]="icon()" class="card-icon"></i>
          <h3>{{ title() }}</h3>
        </div>
      </ng-template>

      <div class="expiration-content">
        <div class="expiration-row">
          <span class="period-label">7 días</span>
          <p-chip
            [label]="count7Days().toString()"
            [styleClass]="getChipClass(count7Days())"
          />
        </div>
        <div class="expiration-row">
          <span class="period-label">15 días</span>
          <p-chip
            [label]="count15Days().toString()"
            [styleClass]="getChipClass(count15Days())"
          />
        </div>
        <div class="expiration-row">
          <span class="period-label">30 días</span>
          <p-chip
            [label]="count30Days().toString()"
            [styleClass]="getChipClass(count30Days())"
          />
        </div>
        <div class="expiration-row">
          <span class="period-label">60 días</span>
          <p-chip
            [label]="count60Days().toString()"
            [styleClass]="getChipClass(count60Days())"
          />
        </div>
      </div>

      <ng-template pTemplate="footer">
        <div class="total-count">
          Total: <strong>{{ totalCount() }}</strong>
        </div>
      </ng-template>
    </p-card>
  `,
  styles: [`
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
      padding: 0.5rem 0;
      border-bottom: 1px solid var(--surface-200);
    }

    .expiration-row:last-child {
      border-bottom: none;
    }

    .period-label {
      font-weight: 500;
      color: var(--text-color-secondary);
    }

    .total-count {
      text-align: right;
      font-size: 1.1rem;
      color: var(--text-color-secondary);
      padding-top: 0.5rem;
      border-top: 2px solid var(--surface-300);
    }

    :host ::ng-deep {
      .chip-critical {
        background-color: var(--red-500);
        color: white;
      }

      .chip-warning {
        background-color: var(--orange-500);
        color: white;
      }

      .chip-info {
        background-color: var(--blue-500);
        color: white;
      }

      .chip-success {
        background-color: var(--green-500);
        color: white;
      }

      .chip-neutral {
        background-color: var(--surface-300);
        color: var(--text-color);
      }
    }
  `],
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
   * Get chip style class based on count
   */
  getChipClass(count: number | undefined): string {
    if (!count || count === 0) return 'chip-neutral';
    if (count >= 10) return 'chip-critical';
    if (count >= 5) return 'chip-warning';
    if (count >= 1) return 'chip-info';
    return 'chip-success';
  }
}
