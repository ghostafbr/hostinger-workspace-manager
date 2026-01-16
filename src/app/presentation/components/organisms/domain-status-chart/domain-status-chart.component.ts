import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { CommonModule } from '@angular/common';
import { DashboardStats } from '@app/application/services/dashboard.service';

/**
 * Domain Status Chart Component
 *
 * Displays a pie chart showing the distribution of domain statuses
 */
@Component({
  selector: 'app-domain-status-chart',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ChartModule, CommonModule],
  template: `
    <div class="glass-chart-card">
      <div class="chart-header">
        <div class="header-title">
          <div class="icon-indicator">
            <i class="pi pi-chart-pie"></i>
          </div>
          <h3>{{ title() }}</h3>
        </div>
      </div>
      <div class="chart-content">
        <p-chart type="doughnut" [data]="chartData()" [options]="chartOptions" height="300px" />
      </div>
    </div>
  `,
  styles: [
    `
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
        box-shadow:
          0 4px 6px -1px rgba(0, 0, 0, 0.1),
          0 2px 4px -1px rgba(0, 0, 0, 0.06);
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
        display: flex;
        justify-content: center;
      }
    `,
  ],
})
export class DomainStatusChartComponent {
  /**
   * Dashboard stats to derive data from
   */
  readonly stats = input.required<DashboardStats | null>();

  /**
   * Chart title
   */
  readonly title = input<string>('Estado de Dominios');

  /**
   * Chart data
   */
  readonly chartData = computed(() => {
    const s = this.stats();
    if (!s) return { labels: [], datasets: [] };

    // Calculate aggregated stats
    const critical = s.domainsExpiring7Days;
    const warning = s.domainsExpiring30Days - s.domainsExpiring7Days;
    const expired = 0; // We define expired as < 0 days, which isn't explicitly in DashboardStats but can be inferred or left 0 if not tracked there
    const active = Math.max(0, s.totalDomains - critical - warning);

    return {
      labels: ['Activos', 'Advertencia (<30d)', 'Críticos (<7d)'],
      datasets: [
        {
          data: [active, warning, critical],
          backgroundColor: [
            '#22c55e', // Green - Active
            '#eab308', // Yellow - Warning
            '#ef4444', // Red - Critical
          ],
          hoverBackgroundColor: ['#16a34a', '#ca8a04', '#dc2626'],
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
        position: 'bottom',
        labels: {
          usePointStyle: true,
          color: '#64748b',
        },
      },
    },
    cutout: '60%',
  };
}
