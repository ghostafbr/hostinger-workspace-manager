import { Injectable, signal } from '@angular/core';
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  QueryConstraint,
  limit,
} from 'firebase/firestore';
import { FirebaseAdapter } from '@app/infrastructure/adapters/firebase.adapter';
import { SyncRun, ISyncRun, SyncRunStatus } from '@app/domain';

/**
 * Sync Run Service
 *
 * Manages sync run history from Firestore
 */
@Injectable({
  providedIn: 'root',
})
export class SyncRunService {
  private readonly firestore = FirebaseAdapter.getFirestore();

  readonly syncRuns = signal<SyncRun[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  /**
   * Get sync runs for a workspace
   */
  async getSyncRunsByWorkspace(workspaceId: string, limitCount = 50): Promise<SyncRun[]> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      const syncRunsRef = collection(this.firestore, 'sync_runs');
      const q = query(
        syncRunsRef,
        where('workspaceId', '==', workspaceId),
        orderBy('startedAt', 'desc'),
        limit(limitCount),
      );

      const snapshot = await getDocs(q);

      const runs = snapshot.docs.map((doc) => {
        const data = doc.data() as Omit<ISyncRun, 'id'>;
        return new SyncRun({ ...data, id: doc.id });
      });

      this.syncRuns.set(runs);
      return runs;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al cargar sync runs';
      this.error.set(errorMessage);
      console.error('Error fetching sync runs:', error);
      throw error;
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Get recent sync runs (all workspaces)
   */
  async getRecentSyncRuns(limitCount = 100): Promise<SyncRun[]> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      const syncRunsRef = collection(this.firestore, 'sync_runs');
      const q = query(syncRunsRef, orderBy('startedAt', 'desc'), limit(limitCount));

      const snapshot = await getDocs(q);

      const runs = snapshot.docs.map((doc) => {
        const data = doc.data() as Omit<ISyncRun, 'id'>;
        return new SyncRun({ ...data, id: doc.id });
      });

      this.syncRuns.set(runs);
      return runs;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al cargar sync runs';
      this.error.set(errorMessage);
      console.error('Error fetching sync runs:', error);
      throw error;
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Get failed sync runs
   */
  async getFailedSyncRuns(workspaceId?: string, limitCount = 50): Promise<SyncRun[]> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      const syncRunsRef = collection(this.firestore, 'sync_runs');
      const constraints: QueryConstraint[] = [
        where('status', '==', SyncRunStatus.FAILED),
        orderBy('startedAt', 'desc'),
        limit(limitCount),
      ];

      if (workspaceId) {
        constraints.unshift(where('workspaceId', '==', workspaceId));
      }

      const q = query(syncRunsRef, ...constraints);
      const snapshot = await getDocs(q);

      const runs = snapshot.docs.map((doc) => {
        const data = doc.data() as Omit<ISyncRun, 'id'>;
        return new SyncRun({ ...data, id: doc.id });
      });

      return runs;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error al cargar sync runs fallidos';
      this.error.set(errorMessage);
      console.error('Error fetching failed sync runs:', error);
      throw error;
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Get sync run statistics for a workspace
   */
  async getSyncStats(workspaceId: string): Promise<{
    totalRuns: number;
    successfulRuns: number;
    failedRuns: number;
    partialRuns: number;
    totalDomains: number;
    totalSubscriptions: number;
    averageDuration: number;
    lastSyncDate: Date | null;
  }> {
    const runs = await this.getSyncRunsByWorkspace(workspaceId, 100);

    const stats = {
      totalRuns: runs.length,
      successfulRuns: runs.filter((r) => r.isSuccess()).length,
      failedRuns: runs.filter((r) => r.isFailed()).length,
      partialRuns: runs.filter((r) => r.isPartialSuccess && r.isPartialSuccess()).length,
      totalDomains: runs.reduce((sum, r) => sum + (r.domainsProcessed || 0), 0),
      totalSubscriptions: runs.reduce((sum, r) => sum + (r.subscriptionsProcessed || 0), 0),
      averageDuration:
        runs.length > 0
          ? runs.reduce((sum, r) => sum + (r.getDurationMs() || 0), 0) / runs.length
          : 0,
      lastSyncDate: runs.length > 0 ? runs[0].startAt.toDate() : null,
    };

    return stats;
  }
}
