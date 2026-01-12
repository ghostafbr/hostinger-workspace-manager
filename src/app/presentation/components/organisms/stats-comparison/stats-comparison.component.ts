import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ChipModule } from 'primeng/chip';

export interface StatComparison {
  label: string;
  current: number;
  previous: number;
  unit?: string;
}

/**
 * Stats Comparison Component
 *
 * Displays comparative statistics with trend indicators
 */
@Component({
  selector: 'app-stats-comparison',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CardModule, ChipModule, DecimalPipe],
  templateUrl: './stats-comparison.component.html',
  styleUrl: './stats-comparison.component.scss',
})
export class StatsComparisonComponent {
  /**
   * Statistics to compare
   */
  readonly stats = input.required<StatComparison[]>();

  /**
   * Component title
   */
  readonly title = input<string>('Comparativa');

  /**
   * Calculate percentage change
   */
  getPercentageChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  }

  /**
   * Get trend icon
   */
  getTrendIcon(current: number, previous: number): string {
    const change = current - previous;
    if (change > 0) return 'pi pi-arrow-up';
    if (change < 0) return 'pi pi-arrow-down';
    return 'pi pi-minus';
  }

  /**
   * Get trend color
   */
  getTrendColor(current: number, previous: number): string {
    const change = current - previous;
    if (change > 0) return 'var(--red-500)'; // More items expiring is bad
    if (change < 0) return 'var(--green-500)'; // Fewer items expiring is good
    return 'var(--text-color-secondary)';
  }

  /**
   * Format number with unit
   */
  formatValue(value: number, unit?: string): string {
    return unit ? `${value} ${unit}` : value.toString();
  }
}
