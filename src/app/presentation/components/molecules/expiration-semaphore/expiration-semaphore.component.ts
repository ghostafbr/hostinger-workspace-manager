import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Expiration Semaphore Component
 *
 * Visual indicator (traffic light) showing expiration status
 * - 🔴 Critical: < 7 days or expired
 * - 🟡 Warning: 7-30 days
 * - 🟢 OK: > 30 days
 */
@Component({
  selector: 'app-expiration-semaphore',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    <div class="semaphore" [class]="statusClass()">
      <div class="semaphore-circle" [title]="tooltip()">
        <span class="semaphore-text">{{ daysText() }}</span>
      </div>
    </div>
  `,
  styles: [`
    .semaphore {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .semaphore-circle {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 0.75rem;
      cursor: help;
      transition: transform 0.2s ease;
    }

    .semaphore-circle:hover {
      transform: scale(1.1);
    }

    .semaphore-text {
      color: white;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
    }

    /* Status colors */
    .critical .semaphore-circle {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);
    }

    .warning .semaphore-circle {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      box-shadow: 0 2px 8px rgba(245, 158, 11, 0.4);
    }

    .ok .semaphore-circle {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      box-shadow: 0 2px 8px rgba(16, 185, 129, 0.4);
    }

    .expired .semaphore-circle {
      background: linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%);
      box-shadow: 0 2px 8px rgba(127, 29, 29, 0.4);
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.7;
      }
    }
  `],
})
export class ExpirationSemaphoreComponent {
  readonly expiresAt = input.required<Date | string | unknown>();

  /**
   * Calculate days until expiration
   */
  readonly daysUntilExpiration = computed(() => {
    const date = this.toDate(this.expiresAt());
    if (!date) return null;

    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    return diffDays;
  });

  /**
   * Status class for styling
   */
  readonly statusClass = computed(() => {
    const days = this.daysUntilExpiration();
    if (days === null) return 'ok';
    if (days < 0) return 'expired';
    if (days <= 7) return 'critical';
    if (days <= 30) return 'warning';
    return 'ok';
  });

  /**
   * Text to display in semaphore
   */
  readonly daysText = computed(() => {
    const days = this.daysUntilExpiration();
    if (days === null) return '?';
    if (days < 0) return '⚠';
    if (days === 0) return 'HOY';
    if (days === 1) return '1d';
    if (days < 100) return `${days}d`;
    return '99+';
  });

  /**
   * Tooltip text
   */
  readonly tooltip = computed(() => {
    const days = this.daysUntilExpiration();
    if (days === null) return 'Fecha desconocida';
    if (days < 0) return `Venció hace ${Math.abs(days)} día(s)`;
    if (days === 0) return '¡Vence hoy!';
    if (days === 1) return 'Vence mañana';
    return `Vence en ${days} día(s)`;
  });

  /**
   * Convert various timestamp formats to Date
   */
  private toDate(timestamp: unknown): Date | null {
    if (!timestamp) return null;
    if (timestamp instanceof Date) return timestamp;
    if (typeof timestamp === 'string') return new Date(timestamp);
    if (typeof timestamp === 'object' && 'toDate' in timestamp) {
      return (timestamp as { toDate: () => Date }).toDate();
    }
    if (typeof timestamp === 'object' && 'seconds' in timestamp) {
      return new Date((timestamp as { seconds: number }).seconds * 1000);
    }
    return null;
  }
}
