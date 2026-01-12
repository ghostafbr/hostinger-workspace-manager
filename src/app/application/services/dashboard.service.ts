import { Injectable, inject, signal } from '@angular/core';
import { Firestore, collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { FirebaseAdapter } from '@app/infrastructure/adapters/firebase.adapter';
import { AuthService } from './auth.service';
import { Workspace, WorkspaceStatus, IDomain, ISubscription } from '@app/domain';
import type {
  ExpirationTrendData,
  TimelineEvent,
  StatComparison,
} from '@app/presentation/components/organisms';

/**
 * Dashboard Statistics
 */
export interface DashboardStats {
  // Expiration counts
  domainsExpiring7Days: number;
  domainsExpiring15Days: number;
  domainsExpiring30Days: number;
  domainsExpiring60Days: number;

  subscriptionsExpiring7Days: number;
  subscriptionsExpiring15Days: number;
  subscriptionsExpiring30Days: number;
  subscriptionsExpiring60Days: number;

  // Workspace health
  totalWorkspaces: number;
  activeWorkspaces: number;
  workspacesInError: Workspace[];

  // Totals
  totalDomains: number;
  totalSubscriptions: number;
}

/**
 * Dashboard Service
 *
 * Provides aggregated statistics for the main dashboard
 */
@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private readonly firestore: Firestore = FirebaseAdapter.getFirestore();
  private readonly authService = inject(AuthService);

  readonly stats = signal<DashboardStats | null>(null);
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  /**
   * Load dashboard statistics
   */
  async loadDashboardStats(): Promise<DashboardStats> {
    try {
      this.isLoading.set(true);
      this.error.set(null);

      const userId = this.authService.getCurrentUserUid();
      if (!userId) {
        throw new Error('User not authenticated');
      }

      // Get all user's workspaces
      const workspacesSnapshot = await getDocs(
        query(collection(this.firestore, 'workspaces'), where('userId', '==', userId)),
      );

      const workspaces = workspacesSnapshot.docs.map((doc) => {
        const data = doc.data() as Record<string, unknown>;
        return Workspace.fromFirestore(doc.id, data);
      });

      // Get workspace IDs for querying domains/subscriptions
      const workspaceIds = workspaces.map((w) => w.id);

      if (workspaceIds.length === 0) {
        // No workspaces, return empty stats
        const emptyStats: DashboardStats = {
          domainsExpiring7Days: 0,
          domainsExpiring15Days: 0,
          domainsExpiring30Days: 0,
          domainsExpiring60Days: 0,
          subscriptionsExpiring7Days: 0,
          subscriptionsExpiring15Days: 0,
          subscriptionsExpiring30Days: 0,
          subscriptionsExpiring60Days: 0,
          totalWorkspaces: 0,
          activeWorkspaces: 0,
          workspacesInError: [],
          totalDomains: 0,
          totalSubscriptions: 0,
        };
        this.stats.set(emptyStats);
        return emptyStats;
      }

      // Firestore 'in' queries support max 30 items, split if needed
      const domainsData = await this.getDomainsForWorkspaces(workspaceIds);
      const subscriptionsData = await this.getSubscriptionsForWorkspaces(workspaceIds);

      // Calculate date thresholds
      const now = new Date();
      const days7 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const days15 = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000);
      const days30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      const days60 = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);

      // Count domain expirations
      const domainsExpiring7 = domainsData.filter((d: IDomain) => {
        const expiresAt = this.toDate(d.expiresAt);
        return expiresAt && expiresAt <= days7 && expiresAt > now;
      }).length;

      const domainsExpiring15 = domainsData.filter((d: IDomain) => {
        const expiresAt = this.toDate(d.expiresAt);
        return expiresAt && expiresAt <= days15 && expiresAt > now;
      }).length;

      const domainsExpiring30 = domainsData.filter((d: IDomain) => {
        const expiresAt = this.toDate(d.expiresAt);
        return expiresAt && expiresAt <= days30 && expiresAt > now;
      }).length;

      const domainsExpiring60 = domainsData.filter((d: IDomain) => {
        const expiresAt = this.toDate(d.expiresAt);
        return expiresAt && expiresAt <= days60 && expiresAt > now;
      }).length;

      // Count subscription expirations
      const subscriptionsExpiring7 = subscriptionsData.filter((s: ISubscription) => {
        const expiresAt = this.toDate(s.expiresAt);
        return expiresAt && expiresAt <= days7 && expiresAt > now;
      }).length;

      const subscriptionsExpiring15 = subscriptionsData.filter((s: ISubscription) => {
        const expiresAt = this.toDate(s.expiresAt);
        return expiresAt && expiresAt <= days15 && expiresAt > now;
      }).length;

      const subscriptionsExpiring30 = subscriptionsData.filter((s: ISubscription) => {
        const expiresAt = this.toDate(s.expiresAt);
        return expiresAt && expiresAt <= days30 && expiresAt > now;
      }).length;

      const subscriptionsExpiring60 = subscriptionsData.filter((s: ISubscription) => {
        const expiresAt = this.toDate(s.expiresAt);
        return expiresAt && expiresAt <= days60 && expiresAt > now;
      }).length;

      // Workspace health
      const activeWorkspaces = workspaces.filter((w) => w.status === WorkspaceStatus.ACTIVE).length;
      const workspacesInError = workspaces.filter((w) => w.status !== WorkspaceStatus.ACTIVE);

      const stats: DashboardStats = {
        domainsExpiring7Days: domainsExpiring7,
        domainsExpiring15Days: domainsExpiring15,
        domainsExpiring30Days: domainsExpiring30,
        domainsExpiring60Days: domainsExpiring60,
        subscriptionsExpiring7Days: subscriptionsExpiring7,
        subscriptionsExpiring15Days: subscriptionsExpiring15,
        subscriptionsExpiring30Days: subscriptionsExpiring30,
        subscriptionsExpiring60Days: subscriptionsExpiring60,
        totalWorkspaces: workspaces.length,
        activeWorkspaces,
        workspacesInError,
        totalDomains: domainsData.length,
        totalSubscriptions: subscriptionsData.length,
      };

      this.stats.set(stats);
      return stats;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to load dashboard stats';
      this.error.set(errorMessage);
      console.error('Error loading dashboard stats:', error);
      throw error;
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Get domains for workspaces (handles batching for 'in' query limit)
   */
  private async getDomainsForWorkspaces(workspaceIds: string[]): Promise<IDomain[]> {
    const allDomains: IDomain[] = [];
    const batchSize = 30; // Firestore 'in' limit

    for (let i = 0; i < workspaceIds.length; i += batchSize) {
      const batch = workspaceIds.slice(i, i + batchSize);
      const snapshot = await getDocs(
        query(collection(this.firestore, 'domains'), where('workspaceId', 'in', batch)),
      );
      snapshot.docs.forEach((doc) => allDomains.push(doc.data() as IDomain));
    }

    return allDomains;
  }

  /**
   * Get subscriptions for workspaces (handles batching)
   */
  private async getSubscriptionsForWorkspaces(workspaceIds: string[]): Promise<ISubscription[]> {
    const allSubscriptions: ISubscription[] = [];
    const batchSize = 30;

    for (let i = 0; i < workspaceIds.length; i += batchSize) {
      const batch = workspaceIds.slice(i, i + batchSize);
      const snapshot = await getDocs(
        query(collection(this.firestore, 'subscriptions'), where('workspaceId', 'in', batch)),
      );
      snapshot.docs.forEach((doc) => allSubscriptions.push(doc.data() as ISubscription));
    }

    return allSubscriptions;
  }

  /**
   * Convert Firestore Timestamp to Date
   */
  private toDate(timestamp: unknown): Date | null {
    if (!timestamp) return null;
    if (timestamp instanceof Date) return timestamp;
    if (timestamp instanceof Timestamp) return timestamp.toDate();
    if (typeof timestamp === 'object' && 'seconds' in timestamp) {
      return new Date((timestamp as { seconds: number }).seconds * 1000);
    }
    return null;
  }

  /**
   * Clear error
   */
  clearError(): void {
    this.error.set(null);
  }

  /**
   * Get expiration trends data for chart
   */
  getExpirationTrends(): ExpirationTrendData[] {
    const stats = this.stats();
    if (!stats) return [];

    return [
      {
        label: '7 días',
        domains: stats.domainsExpiring7Days,
        subscriptions: stats.subscriptionsExpiring7Days,
      },
      {
        label: '15 días',
        domains: stats.domainsExpiring15Days,
        subscriptions: stats.subscriptionsExpiring15Days,
      },
      {
        label: '30 días',
        domains: stats.domainsExpiring30Days,
        subscriptions: stats.subscriptionsExpiring30Days,
      },
      {
        label: '60 días',
        domains: stats.domainsExpiring60Days,
        subscriptions: stats.subscriptionsExpiring60Days,
      },
    ];
  }

  /**
   * Get upcoming events for timeline
   * This requires fetching full domain/subscription data
   */
  async getUpcomingEvents(limit = 10): Promise<TimelineEvent[]> {
    try {
      const userId = this.authService.getCurrentUserUid();
      if (!userId) return [];

      // Get all user's workspaces
      const workspacesSnapshot = await getDocs(
        query(collection(this.firestore, 'workspaces'), where('userId', '==', userId)),
      );

      const workspaces = workspacesSnapshot.docs.map((doc) => {
        const data = doc.data() as Record<string, unknown>;
        return Workspace.fromFirestore(doc.id, data);
      });

      const workspaceIds = workspaces.map((w) => w.id);
      if (workspaceIds.length === 0) return [];

      // Create workspace map for quick lookup
      const workspaceMap = new Map(workspaces.map((w) => [w.id, w.name]));

      // Get domains and subscriptions
      const domainsData = await this.getDomainsForWorkspaces(workspaceIds);
      const subscriptionsData = await this.getSubscriptionsForWorkspaces(workspaceIds);

      const now = new Date();
      const events: TimelineEvent[] = [];

      // Process domains
      domainsData.forEach((domain: IDomain) => {
        const expiresAt = this.toDate(domain.expiresAt);
        if (!expiresAt || expiresAt <= now) return;

        const daysUntilExpiration = Math.ceil(
          (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
        );

        events.push({
          id: domain.id,
          title: domain.domainName,
          type: 'domain',
          expirationDate: expiresAt,
          workspaceName: workspaceMap.get(domain.workspaceId) || 'Unknown',
          daysUntilExpiration,
          status: daysUntilExpiration <= 7 ? 'critical' : daysUntilExpiration <= 15 ? 'warning' : 'info',
        });
      });

      // Process subscriptions
      subscriptionsData.forEach((sub: ISubscription) => {
        const expiresAt = this.toDate(sub.expiresAt);
        if (!expiresAt || expiresAt <= now) return;

        const daysUntilExpiration = Math.ceil(
          (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
        );

        events.push({
          id: sub.id,
          title: sub.productName,
          type: 'subscription',
          expirationDate: expiresAt,
          workspaceName: workspaceMap.get(sub.workspaceId) || 'Unknown',
          daysUntilExpiration,
          status: daysUntilExpiration <= 7 ? 'critical' : daysUntilExpiration <= 15 ? 'warning' : 'info',
        });
      });

      // Sort by expiration date and limit
      return events.sort((a, b) => a.daysUntilExpiration - b.daysUntilExpiration).slice(0, limit);
    } catch (error) {
      console.error('Error getting upcoming events:', error);
      return [];
    }
  }

  /**
   * Get stats comparison data
   * Note: This is a placeholder - you'll need to implement historical data tracking
   */
  getStatsComparison(): StatComparison[] {
    const stats = this.stats();
    if (!stats) return [];

    // Placeholder: using current values with simulated previous values
    // In a real implementation, you'd fetch historical data from Firestore
    return [
      {
        label: 'Total Workspaces',
        current: stats.totalWorkspaces,
        previous: Math.max(0, stats.totalWorkspaces - 1),
      },
      {
        label: 'Dominios',
        current: stats.totalDomains,
        previous: Math.max(0, stats.totalDomains - Math.floor(Math.random() * 5)),
      },
      {
        label: 'Suscripciones',
        current: stats.totalSubscriptions,
        previous: Math.max(0, stats.totalSubscriptions - Math.floor(Math.random() * 3)),
      },
      {
        label: 'Vencimientos (7d)',
        current: stats.domainsExpiring7Days + stats.subscriptionsExpiring7Days,
        previous: Math.floor(
          (stats.domainsExpiring7Days + stats.subscriptionsExpiring7Days) * (0.8 + Math.random() * 0.4),
        ),
      },
    ];
  }
}
