import { Injectable, inject, signal } from '@angular/core';
import {
  Firestore,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  addDoc,
  deleteDoc,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import { FirebaseAdapter } from '@app/infrastructure/adapters/firebase.adapter';
import { AuthService } from './auth.service';
import { DashboardService } from './dashboard.service';
import type { IDashboardSnapshot } from '@app/domain';

/**
 * Snapshot Service
 *
 * Manages dashboard snapshots for historical comparison
 */
@Injectable({
  providedIn: 'root',
})
export class SnapshotService {
  private readonly firestore: Firestore = FirebaseAdapter.getFirestore();
  private readonly authService = inject(AuthService);
  private readonly dashboardService = inject(DashboardService);

  readonly snapshots = signal<IDashboardSnapshot[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  /**
   * Create a snapshot of current dashboard state
   */
  async createSnapshot(): Promise<string> {
    try {
      this.isLoading.set(true);
      this.error.set(null);

      const userId = this.authService.getCurrentUserUid();
      if (!userId) throw new Error('User not authenticated');

      // Get current dashboard stats
      const stats = await this.dashboardService.loadDashboardStats();

      const snapshot: Omit<IDashboardSnapshot, 'id'> = {
        userId,
        snapshotAt: serverTimestamp() as Timestamp,
        totalWorkspaces: stats.totalWorkspaces,
        activeWorkspaces: stats.activeWorkspaces,
        totalDomains: stats.totalDomains,
        totalSubscriptions: stats.totalSubscriptions,
        domainsExpiring7Days: stats.domainsExpiring7Days,
        domainsExpiring15Days: stats.domainsExpiring15Days,
        domainsExpiring30Days: stats.domainsExpiring30Days,
        domainsExpiring60Days: stats.domainsExpiring60Days,
        subscriptionsExpiring7Days: stats.subscriptionsExpiring7Days,
        subscriptionsExpiring15Days: stats.subscriptionsExpiring15Days,
        subscriptionsExpiring30Days: stats.subscriptionsExpiring30Days,
        subscriptionsExpiring60Days: stats.subscriptionsExpiring60Days,
        workspacesInError: stats.workspacesInError.length,
      };

      const docRef = await addDoc(collection(this.firestore, 'dashboardSnapshots'), snapshot);

      // Reload snapshots
      await this.loadSnapshots();

      return docRef.id;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create snapshot';
      this.error.set(message);
      throw error;
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Load snapshots for current user
   */
  async loadSnapshots(maxCount = 30): Promise<IDashboardSnapshot[]> {
    try {
      this.isLoading.set(true);
      this.error.set(null);

      const userId = this.authService.getCurrentUserUid();
      if (!userId) throw new Error('User not authenticated');

      const q = query(
        collection(this.firestore, 'dashboardSnapshots'),
        where('userId', '==', userId),
        orderBy('snapshotAt', 'desc'),
        limit(maxCount),
      );

      const snapshot = await getDocs(q);

      const snapshots: IDashboardSnapshot[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<IDashboardSnapshot, 'id'>),
      }));

      this.snapshots.set(snapshots);
      return snapshots;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load snapshots';
      this.error.set(message);
      throw error;
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Get snapshot comparison data for charts
   */
  getComparisonData(snapshots: IDashboardSnapshot[] = this.snapshots()): {
    labels: string[];
    workspaces: number[];
    domains: number[];
    subscriptions: number[];
  } {
    // Sort by snapshotAt ascending
    const sorted = [...snapshots].sort((a, b) => {
      const dateA = a.snapshotAt instanceof Timestamp ? a.snapshotAt.toDate() : a.snapshotAt;
      const dateB = b.snapshotAt instanceof Timestamp ? b.snapshotAt.toDate() : b.snapshotAt;
      return dateA.getTime() - dateB.getTime();
    });

    return {
      labels: sorted.map((s) => {
        const date = s.snapshotAt instanceof Timestamp ? s.snapshotAt.toDate() : s.snapshotAt;
        return date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
      }),
      workspaces: sorted.map((s) => s.totalWorkspaces),
      domains: sorted.map((s) => s.totalDomains),
      subscriptions: sorted.map((s) => s.totalSubscriptions),
    };
  }

  /**
   * Get change metrics between two snapshots
   */
  getChangeMetrics(
    current: IDashboardSnapshot,
    previous: IDashboardSnapshot,
  ): {
    workspaceChange: number;
    domainChange: number;
    subscriptionChange: number;
    expiringDomainsChange: number;
  } {
    return {
      workspaceChange: current.totalWorkspaces - previous.totalWorkspaces,
      domainChange: current.totalDomains - previous.totalDomains,
      subscriptionChange: current.totalSubscriptions - previous.totalSubscriptions,
      expiringDomainsChange: current.domainsExpiring7Days - previous.domainsExpiring7Days,
    };
  }

  /**
   * Delete old snapshots (retention policy)
   */
  async deleteOldSnapshots(daysToKeep = 90): Promise<void> {
    try {
      const userId = this.authService.getCurrentUserUid();
      if (!userId) throw new Error('User not authenticated');

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const q = query(
        collection(this.firestore, 'dashboardSnapshots'),
        where('userId', '==', userId),
        where('snapshotAt', '<', Timestamp.fromDate(cutoffDate)),
      );

      const snapshot = await getDocs(q);

      const deletes = snapshot.docs.map((doc) => deleteDoc(doc.ref));

      await Promise.all(deletes);

      // Reload snapshots
      await this.loadSnapshots();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete old snapshots';
      this.error.set(message);
      throw error;
    }
  }

  /**
   * Get latest snapshot
   */
  getLatestSnapshot(): IDashboardSnapshot | null {
    const snaps = this.snapshots();
    if (snaps.length === 0) return null;
    return snaps[0]; // Already ordered by snapshotAt desc
  }

  /**
   * Get snapshot from X days ago
   */
  getSnapshotDaysAgo(days: number): IDashboardSnapshot | null {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() - days);

    return (
      this.snapshots().find((s) => {
        const date = s.snapshotAt instanceof Timestamp ? s.snapshotAt.toDate() : s.snapshotAt;
        return date.toDateString() === targetDate.toDateString();
      }) || null
    );
  }
}
