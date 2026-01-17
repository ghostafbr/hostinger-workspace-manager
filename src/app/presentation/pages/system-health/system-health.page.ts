import { Component, OnInit, signal, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ProgressBarModule } from 'primeng/progressbar';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ToolbarModule } from 'primeng/toolbar';
import { ChartModule } from 'primeng/chart';

import { HealthService } from '@app/application';
import type { HealthMetrics, SystemHealthSummary } from '@app/domain';
import { HealthStatus } from '@app/domain';

/**
 * System Health Dashboard Page
 * Displays workspace health metrics, system-wide statistics, and alerts
 */
@Component({
  selector: 'app-system-health',
  templateUrl: './system-health.page.html',
  styleUrls: ['./system-health.page.scss'],

  imports: [
    DecimalPipe,
    ProgressBarModule,
    CardModule,
    ButtonModule,
    TableModule,
    TagModule,
    TooltipModule,
    ToolbarModule,
    ChartModule,
  ],
})
export default class SystemHealthPage implements OnInit {
  readonly healthService = inject(HealthService);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);

  // State signals
  readonly workspaceMetrics = signal<HealthMetrics[]>([]);
  readonly systemSummary = signal<SystemHealthSummary | null>(null);
  readonly isLoading = signal<boolean>(false);
  readonly selectedFilter = signal<'all' | 'healthy' | 'warning' | 'critical'>('all');

  // Chart data
  readonly healthScoreChartData = signal<unknown>(null);
  readonly syncRateChartData = signal<unknown>(null);

  // Enum reference for template
  readonly HealthStatus = HealthStatus;

  async ngOnInit(): Promise<void> {
    await this.loadHealthData();
    this.initializeCharts();

    // Auto-detect and create alerts
    await this.detectAlerts();
  }

  /**
   * Load all health data
   */
  async loadHealthData(): Promise<void> {
    this.isLoading.set(true);

    try {
      const [metrics, summary] = await Promise.all([
        this.healthService.getAllHealthMetrics(),
        this.healthService.getSystemHealthSummary(),
      ]);

      this.workspaceMetrics.set(metrics);
      this.systemSummary.set(summary);
      this.updateCharts(metrics);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error loading health data';
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: errorMessage,
      });
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Refresh health data
   */
  async refreshData(): Promise<void> {
    await this.loadHealthData();
    await this.detectAlerts();

    this.messageService.add({
      severity: 'success',
      summary: 'Actualizado',
      detail: 'Datos de salud actualizados correctamente',
    });
  }

  /**
   * Detect health alerts automatically
   */
  private async detectAlerts(): Promise<void> {
    try {
      const alertsCreated = await this.healthService.detectAndCreateAlerts();
      if (alertsCreated > 0) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Alertas Detectadas',
          detail: `Se detectaron ${alertsCreated} problemas de salud`,
          life: 5000,
        });
      }
    } catch (error: unknown) {
      console.error('[SystemHealth] Error detecting alerts:', error);
    }
  }

  /**
   * Initialize chart configurations
   */
  private initializeCharts(): void {
    const documentStyle = getComputedStyle(document.documentElement);

    // Health Score Chart
    this.healthScoreChartData.set({
      labels: [],
      datasets: [
        {
          label: 'Health Score',
          data: [],
          backgroundColor: documentStyle.getPropertyValue('--green-500'),
          borderColor: documentStyle.getPropertyValue('--green-600'),
          borderWidth: 1,
        },
      ],
    });

    // Sync Rate Chart
    this.syncRateChartData.set({
      labels: [],
      datasets: [
        {
          label: 'Sync Success Rate (%)',
          data: [],
          backgroundColor: documentStyle.getPropertyValue('--blue-500'),
          borderColor: documentStyle.getPropertyValue('--blue-600'),
          borderWidth: 1,
        },
      ],
    });
  }

  /**
   * Update charts with new data
   */
  private updateCharts(metrics: HealthMetrics[]): void {
    const documentStyle = getComputedStyle(document.documentElement);

    // Sort by health score (lowest first for visibility)
    const sortedMetrics = [...metrics].sort((a, b) => a.healthScore - b.healthScore);

    // Health Score Chart
    this.healthScoreChartData.set({
      labels: sortedMetrics.map((m) => m.workspaceName),
      datasets: [
        {
          label: 'Health Score',
          data: sortedMetrics.map((m) => m.healthScore),
          backgroundColor: sortedMetrics.map((m) => {
            if (m.healthScore >= 80) return documentStyle.getPropertyValue('--green-500');
            if (m.healthScore >= 50) return documentStyle.getPropertyValue('--yellow-500');
            return documentStyle.getPropertyValue('--red-500');
          }),
        },
      ],
    });

    // Sync Rate Chart
    this.syncRateChartData.set({
      labels: sortedMetrics.map((m) => m.workspaceName),
      datasets: [
        {
          label: 'Sync Success Rate (%)',
          data: sortedMetrics.map((m) => m.getSyncSuccessRate()),
          backgroundColor: documentStyle.getPropertyValue('--blue-500'),
        },
      ],
    });
  }

  /**
   * Get filtered workspace metrics
   */
  getFilteredMetrics(): HealthMetrics[] {
    const filter = this.selectedFilter();
    const metrics = this.workspaceMetrics();

    switch (filter) {
      case 'healthy':
        return metrics.filter((m) => m.healthStatus === HealthStatus.HEALTHY);
      case 'warning':
        return metrics.filter((m) => m.healthStatus === HealthStatus.WARNING);
      case 'critical':
        return metrics.filter((m) => m.healthStatus === HealthStatus.CRITICAL);
      default:
        return metrics;
    }
  }

  /**
   * Get health status severity for PrimeNG tag
   */
  getHealthSeverity(status: string): 'success' | 'warn' | 'danger' | 'info' | 'secondary' {
    switch (status) {
      case HealthStatus.HEALTHY:
        return 'success';
      case HealthStatus.WARNING:
        return 'warn';
      case HealthStatus.CRITICAL:
        return 'danger';
      default:
        return 'info';
    }
  }

  /**
   * Get circuit breaker severity
   */
  getCircuitSeverity(status: string): 'success' | 'warn' | 'danger' | 'info' | 'secondary' {
    switch (status) {
      case 'closed':
        return 'success';
      case 'half-open':
        return 'warn';
      case 'open':
        return 'danger';
      default:
        return 'info';
    }
  }

  /**
   * Navigate to workspace details
   */
  goToWorkspace(workspaceId: string): void {
    this.router.navigate(['/workspace', workspaceId]);
  }

  /**
   * Set filter
   */
  setFilter(filter: 'all' | 'healthy' | 'warning' | 'critical'): void {
    this.selectedFilter.set(filter);
  }

  /**
   * Format timestamp to relative time
   */
  formatRelativeTime(date: Date | null): string {
    if (!date) return 'Nunca';

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Justo ahora';
    if (diffMins < 60) return `Hace ${diffMins} minutos`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Hace ${diffHours} horas`;

    const diffDays = Math.floor(diffHours / 24);
    return `Hace ${diffDays} días`;
  }

  /**
   * Format percentage
   */
  formatPercentage(value: number): string {
    return `${Math.round(value)}%`;
  }
}
