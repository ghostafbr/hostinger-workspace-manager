import { Injectable, inject, signal } from '@angular/core';
import { AlertLogModel, EntityType } from '@app/domain';
import { ALERT_REPOSITORY } from '@app/domain/repositories/alert.repository';

/**
 * Alert Service
 *
 * Manages alert logs using Repository Pattern
 */
@Injectable({
  providedIn: 'root',
})
export class AlertService {
  private readonly alertRepo = inject(ALERT_REPOSITORY);

  readonly alerts = signal<AlertLogModel[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  /**
   * Get all alerts for a workspace
   */
  async getAlertsByWorkspace(
    workspaceId: string,
    filters?: {
      entityType?: EntityType;
      daysBefore?: number;
      processed?: boolean;
    },
  ): Promise<AlertLogModel[]> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      const alertsList = await this.alertRepo.getAlertsByWorkspace(workspaceId, filters);
      this.alerts.set(alertsList);
      return alertsList;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al cargar alertas';
      this.error.set(errorMessage);
      console.error('Error fetching alerts:', error);
      throw error;
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Get alerts by entity (domain or subscription)
   */
  async getAlertsByEntity(
    workspaceId: string,
    entityId: string,
    entityType: EntityType,
  ): Promise<AlertLogModel[]> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      return await this.alertRepo.getAlertsByEntity(workspaceId, entityId, entityType);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error al cargar alertas de entidad';
      this.error.set(errorMessage);
      console.error('Error fetching entity alerts:', error);
      throw error;
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Get recent critical alerts (last 7 days, ≤ 7 days before expiration)
   */
  async getCriticalAlerts(workspaceId: string): Promise<AlertLogModel[]> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      return await this.alertRepo.getCriticalAlerts(workspaceId, 7);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error al cargar alertas críticas';
      this.error.set(errorMessage);
      console.error('Error fetching critical alerts:', error);
      throw error;
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Get alert statistics for a workspace
   */
  async getAlertStats(workspaceId: string): Promise<{
    totalAlerts: number;
    criticalAlerts: number;
    warningAlerts: number;
    infoAlerts: number;
    byEntityType: { domains: number; subscriptions: number };
  }> {
    const alerts = await this.getAlertsByWorkspace(workspaceId);

    const stats = {
      totalAlerts: alerts.length,
      criticalAlerts: alerts.filter((a) => a.isCritical()).length,
      warningAlerts: alerts.filter((a) => a.isWarning()).length,
      infoAlerts: alerts.filter((a) => a.isInfo()).length,
      byEntityType: {
        domains: alerts.filter((a) => a.entityType === EntityType.DOMAIN).length,
        subscriptions: alerts.filter((a) => a.entityType === EntityType.SUBSCRIPTION).length,
      },
    };

    return stats;
  }
}
