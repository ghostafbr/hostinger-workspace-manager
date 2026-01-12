import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { CardModule } from 'primeng/card';

export interface ExpirationTrendData {
  label: string;
  domains: number;
  subscriptions: number;
}

/**
 * Expiration Trends Chart Component
 *
 * Displays a bar chart showing expiration trends for domains and subscriptions
 */
@Component({
  selector: 'app-expiration-trends-chart',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ChartModule, CardModule],
  templateUrl: './expiration-trends-chart.component.html',
  styleUrl: './expiration-trends-chart.component.scss',
})
export class ExpirationTrendsChartComponent {
  /**
   * Trend data to display
   */
  readonly data = input.required<ExpirationTrendData[]>();

  /**
   * Chart title
   */
  readonly title = input<string>('Tendencias de Vencimientos');

  /**
   * Chart data for PrimeNG Chart
   */
  readonly chartData = computed(() => {
    const trends = this.data();

    return {
      labels: trends.map((t) => t.label),
      datasets: [
        {
          label: 'Dominios',
          data: trends.map((t) => t.domains),
          backgroundColor: 'rgba(100, 116, 139, 0.8)', // Neutral gray
          borderColor: 'rgb(100, 116, 139)',
          borderWidth: 1,
        },
        {
          label: 'Suscripciones',
          data: trends.map((t) => t.subscriptions),
          backgroundColor: 'rgba(71, 85, 105, 0.8)', // Neutral gray-blue
          borderColor: 'rgb(71, 85, 105)',
          borderWidth: 1,
        },
      ],
    };
  });

  /**
   * Chart options
   */
  readonly chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 15,
        },
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
        title: {
          display: true,
          text: 'Cantidad',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Período',
        },
      },
    },
  };
}
