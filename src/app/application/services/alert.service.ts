import { Injectable, signal } from '@angular/core';
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  Timestamp,
  QueryConstraint,
} from 'firebase/firestore';
import { FirebaseAdapter } from '@app/infrastructure/adapters/firebase.adapter';
import { AlertLogModel, IAlertLog, EntityType } from '@app/domain';

/**
 * Alert Service
 *
 * Manages alert logs from Firestore
 */
@Injectable({
  providedIn: 'root',
})
export class AlertService {
  private readonly firestore = FirebaseAdapter.getFirestore();

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
      const alertsRef = collection(this.firestore, 'alert_logs');
      const constraints: QueryConstraint[] = [
        where('workspaceId', '==', workspaceId),
        orderBy('createdAt', 'desc'),
      ];

      // Apply optional filters
      if (filters?.entityType) {
        constraints.push(where('entityType', '==', filters.entityType));
      }
      if (filters?.daysBefore !== undefined) {
        constraints.push(where('daysBefore', '==', filters.daysBefore));
      }
      if (filters?.processed !== undefined) {
        constraints.push(where('processed', '==', filters.processed));
      }

      const q = query(alertsRef, ...constraints);
      const snapshot = await getDocs(q);

      const alertsList = snapshot.docs.map((doc) => {
        const data = doc.data() as Omit<IAlertLog, 'id'>;
        return new AlertLogModel({ ...data, id: doc.id });
      });

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
      const alertsRef = collection(this.firestore, 'alert_logs');
      const q = query(
        alertsRef,
        where('workspaceId', '==', workspaceId),
        where('entityId', '==', entityId),
        where('entityType', '==', entityType),
        orderBy('createdAt', 'desc'),
      );

      const snapshot = await getDocs(q);
      const alertsList = snapshot.docs.map((doc) => {
        const data = doc.data() as Omit<IAlertLog, 'id'>;
        return new AlertLogModel({ ...data, id: doc.id });
      });

      return alertsList;
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
      const sevenDaysAgo = Timestamp.fromDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));

      const alertsRef = collection(this.firestore, 'alert_logs');
      const q = query(
        alertsRef,
        where('workspaceId', '==', workspaceId),
        where('daysBefore', '<=', 7),
        where('createdAt', '>=', sevenDaysAgo),
        orderBy('createdAt', 'desc'),
      );

      const snapshot = await getDocs(q);
      const alertsList = snapshot.docs.map((doc) => {
        const data = doc.data() as Omit<IAlertLog, 'id'>;
        return new AlertLogModel({ ...data, id: doc.id });
      });

      return alertsList;
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
