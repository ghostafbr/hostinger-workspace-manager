import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { CommonModule } from '@angular/common';

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
  imports: [ChartModule, CommonModule],
  template: `
    <div class="glass-chart-card">
      <div class="chart-header">
        <div class="header-title">
          <div class="icon-indicator">
            <i class="pi pi-chart-line"></i>
          </div>
          <h3>{{ title() }}</h3>
        </div>
        <!-- Future: Add periods selector here? -->
      </div>
      <div class="chart-content">
        <p-chart type="bar" [data]="chartData()" [options]="chartOptions" height="300px" />
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    .glass-chart-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
      transition: box-shadow 0.2s;
    }
    .glass-chart-card:hover {
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }
    .chart-header {
      margin-bottom: 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .chart-header .header-title {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .chart-header .header-title .icon-indicator {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: var(--surface-50);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--primary-color);
      border: 1px solid #e2e8f0;
    }
    .chart-header .header-title .icon-indicator i {
      font-size: 1.2rem;
    }
    .chart-header .header-title h3 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: #1e293b;
    }
    .chart-content {
      position: relative;
      width: 100%;
    }
  `],
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
    // Brand colors matching the Slate theme
    // Domains: Slate 600 (#475569)
    // Subscriptions: Slate 400 (#94a3b8)

    return {
      labels: trends.map((t) => t.label),
      datasets: [
        {
          label: 'Dominios',
          data: trends.map((t) => t.domains),
          backgroundColor: '#475569',
          hoverBackgroundColor: '#334155',
          borderRadius: 4,
          borderSkipped: false,
          barPercentage: 0.6,
          categoryPercentage: 0.8,
        },
        {
          label: 'Suscripciones',
          data: trends.map((t) => t.subscriptions),
          backgroundColor: '#94a3b8',
          hoverBackgroundColor: '#64748b',
          borderRadius: 4,
          borderSkipped: false,
          barPercentage: 0.6,
          categoryPercentage: 0.8,
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
        align: 'end' as const, // Align legend to the right
        labels: {
          usePointStyle: true,
          pointStyle: 'rectRounded',
          boxWidth: 10,
          boxHeight: 10,
          padding: 20,
          color: '#64748b', // Slate 500
          font: {
            family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            size: 12,
          },
        },
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: '#1e293b', // Dark tooltip
        titleColor: '#f8fafc',
        bodyColor: '#e2e8f0',
        padding: 10,
        cornerRadius: 8,
        displayColors: true,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        border: { display: false }, // Remove axis line
        grid: {
          color: '#f1f5f9', // Very light grid (Slate 100)
          drawBorder: false,
        },
        ticks: {
          stepSize: 1,
          color: '#94a3b8', // Slate 400
          font: { size: 11 },
        },
      },
      x: {
        border: { display: false },
        grid: {
          display: false, // No vertical grid lines
        },
        ticks: {
          color: '#64748b', // Slate 500
          font: { weight: 500 },
        },
      },
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false,
    },
  };
}
