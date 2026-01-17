import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { DashboardStats } from '@app/application/services/dashboard.service';
import { ChartCardComponent } from '../../molecules/chart-card/chart-card.component';

/**
 * Domain Status Chart Component
 *
 * Displays a pie chart showing the distribution of domain statuses
 */
@Component({
  selector: 'app-domain-status-chart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ChartModule, ChartCardComponent],
  template: `
    <app-chart-card [title]="title()" icon="pi pi-chart-pie">
      <p-chart type="doughnut" [data]="chartData()" [options]="chartOptions" height="300px" />
    </app-chart-card>
  `,
  styles: [
    `
      :host {
        display: block;
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
