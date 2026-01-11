import { Injectable, signal } from '@angular/core';
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  Timestamp,
  QueryConstraint,
  limit,
} from 'firebase/firestore';
import { FirebaseAdapter } from '@app/infrastructure/adapters/firebase.adapter';
import { AuditLogModel, IAuditLog, AuditAction, AuditStatus } from '@app/domain';

/**
 * Audit Log Service
 *
 * Manages audit logs from Firestore
 */
@Injectable({
  providedIn: 'root',
})
export class AuditLogService {
  private readonly firestore = FirebaseAdapter.getFirestore();

  readonly auditLogs = signal<AuditLogModel[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  /**
   * Get audit logs with optional filters
   */
  async getAuditLogs(filters?: {
    workspaceId?: string;
    actorUid?: string;
    action?: AuditAction;
    status?: AuditStatus;
    startDate?: Date;
    endDate?: Date;
    limitCount?: number;
  }): Promise<AuditLogModel[]> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      const auditLogsRef = collection(this.firestore, 'audit_logs');
      const constraints: QueryConstraint[] = [orderBy('createdAt', 'desc')];

      // Apply filters
      if (filters?.workspaceId) {
        constraints.push(where('workspaceId', '==', filters.workspaceId));
      }
      if (filters?.actorUid) {
        constraints.push(where('actorUid', '==', filters.actorUid));
      }
      if (filters?.action) {
        constraints.push(where('action', '==', filters.action));
      }
      if (filters?.status) {
        constraints.push(where('status', '==', filters.status));
      }
      if (filters?.startDate) {
        constraints.push(where('createdAt', '>=', Timestamp.fromDate(filters.startDate)));
      }
      if (filters?.endDate) {
        constraints.push(where('createdAt', '<=', Timestamp.fromDate(filters.endDate)));
      }
      if (filters?.limitCount) {
        constraints.push(limit(filters.limitCount));
      }

      const q = query(auditLogsRef, ...constraints);
      const snapshot = await getDocs(q);

      const logs = snapshot.docs.map((doc) => {
        const data = doc.data() as Omit<IAuditLog, 'id'>;
        return new AuditLogModel({ ...data, id: doc.id });
      });

      this.auditLogs.set(logs);
      return logs;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al cargar audit logs';
      this.error.set(errorMessage);
      console.error('Error fetching audit logs:', error);
      throw error;
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Get audit logs for a specific workspace
   */
  async getWorkspaceAuditLogs(workspaceId: string, limitCount = 50): Promise<AuditLogModel[]> {
    return this.getAuditLogs({ workspaceId, limitCount });
  }

  /**
   * Get recent audit logs (last 24 hours)
   */
  async getRecentAuditLogs(limitCount = 100): Promise<AuditLogModel[]> {
    const startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return this.getAuditLogs({ startDate, limitCount });
  }

  /**
   * Get failed audit logs
   */
  async getFailedAuditLogs(workspaceId?: string, limitCount = 50): Promise<AuditLogModel[]> {
    return this.getAuditLogs({
      workspaceId,
      status: AuditStatus.FAILED,
      limitCount,
    });
  }

  /**
   * Get audit log statistics
   */
  async getAuditStats(workspaceId?: string): Promise<{
    total: number;
    success: number;
    failure: number;
    partial: number;
    byAction: Record<string, number>;
  }> {
    const logs = await this.getAuditLogs({ workspaceId, limitCount: 1000 });

    const stats = {
      total: logs.length,
      success: logs.filter((log) => log.isSuccess()).length,
      failure: logs.filter((log) => log.isFailure()).length,
      partial: logs.filter((log) => log.isPartial()).length,
      byAction: {} as Record<string, number>,
    };

    // Count by action
    logs.forEach((log) => {
      stats.byAction[log.action] = (stats.byAction[log.action] || 0) + 1;
    });

    return stats;
  }
}
