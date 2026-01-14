import { Injectable, signal, computed } from '@angular/core';
import type { Firestore } from 'firebase/firestore';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  Timestamp,
  orderBy,
} from 'firebase/firestore';
import { FirebaseAdapter } from '@app/infrastructure/adapters/firebase.adapter';
import type {
  IHealthMetrics,
  ISystemHealthSummary,
} from '@app/domain';
import {
  HealthMetrics,
  SystemHealthSummary,
  HealthStatus,
  CircuitBreakerStatus,
  SyncRunStatus,
  HealthHistory,
} from '@app/domain';

/**
 * Firebase Timestamp helper interface
 */
interface FirebaseTimestamp {
  toDate: () => Date;
}

/**
 * Service for managing workspace and system health metrics
 */
@Injectable({
  providedIn: 'root',
})
export class HealthService {
  private readonly firestore: Firestore;

  constructor() {
    this.firestore = FirebaseAdapter.getFirestore();
  }

  // State signals
  readonly workspaceMetrics = signal<HealthMetrics[]>([]);
  readonly systemSummary = signal<SystemHealthSummary | null>(null);
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  // Computed signals
  readonly healthyWorkspaces = computed(() =>
    this.workspaceMetrics().filter((m) => m.healthStatus === HealthStatus.HEALTHY)
  );

  readonly criticalWorkspaces = computed(() =>
    this.workspaceMetrics().filter((m) => m.healthStatus === HealthStatus.CRITICAL)
  );

  readonly warningWorkspaces = computed(() =>
    this.workspaceMetrics().filter((m) => m.healthStatus === HealthStatus.WARNING)
  );

  readonly workspacesNearLimit = computed(() =>
    this.workspaceMetrics().filter((m) => m.isNearRateLimit())
  );

  /**
   * Get health metrics for all workspaces
   */
  async getAllHealthMetrics(): Promise<HealthMetrics[]> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      // Get all workspaces
      const workspacesRef = collection(this.firestore, 'workspaces');
      const workspacesSnapshot = await getDocs(workspacesRef);


      const metricsPromises = workspacesSnapshot.docs.map(async (workspaceDoc) => {
        const workspaceData = workspaceDoc.data();
        return this.calculateWorkspaceMetrics(
          workspaceDoc.id,
          (workspaceData['name'] as string) || 'Unknown'
        );
      });

      const metrics = await Promise.all(metricsPromises);
      this.workspaceMetrics.set(metrics);

      return metrics;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error fetching health metrics';
      this.error.set(errorMessage);
      throw error;
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Get health metrics for a specific workspace
   */
  async getWorkspaceHealth(workspaceId: string, workspaceName: string): Promise<HealthMetrics> {
    return this.calculateWorkspaceMetrics(workspaceId, workspaceName);
  }

  /**
   * Calculate health metrics for a workspace
   */
  private async calculateWorkspaceMetrics(
    workspaceId: string,
    workspaceName: string
  ): Promise<HealthMetrics> {

    // Get sync runs for this workspace (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const syncRunsRef = collection(this.firestore, 'sync_runs');
    const syncRunsQuery = query(
      syncRunsRef,
      where('workspaceId', '==', workspaceId),
      where('startedAt', '>=', Timestamp.fromDate(thirtyDaysAgo)),
      orderBy('startedAt', 'desc')
    );


    let syncRunsSnapshot;
    try {
      syncRunsSnapshot = await getDocs(syncRunsQuery);
    } catch (error: unknown) {
      console.error(`[HealthService] Query failed:`, error);
      // Si falla el query compuesto, intentar sin el orderBy
      const simpleQuery = query(
        syncRunsRef,
        where('workspaceId', '==', workspaceId)
      );
      syncRunsSnapshot = await getDocs(simpleQuery);
    }

    const syncRuns = syncRunsSnapshot.docs.map((doc) => {
      const data = doc.data() as Record<string, unknown>;
      return {
        id: doc.id,
        ...data,
      };
    }) as (Record<string, unknown> & { id: string })[];

    if (syncRuns.length === 0) {
      console.warn(`[HealthService] No syncRuns found for workspace ${workspaceId}. Checking if any syncRuns exist at all...`);
      // Query all syncRuns to debug
      const allSyncRunsSnapshot = await getDocs(collection(this.firestore, 'sync_runs'));
      console.warn(`[HealthService] Total syncRuns in database: ${allSyncRunsSnapshot.docs.length}`);
      if (allSyncRunsSnapshot.docs.length > 0) {
        const sampleDoc = allSyncRunsSnapshot.docs[0];
        console.warn('[HealthService] Sample document from syncRuns collection:', {
          id: sampleDoc.id,
          data: sampleDoc.data(),
        });
      }
    }

    // Calculate sync metrics
    const totalSyncs = syncRuns.length;
    const successfulSyncs = syncRuns.filter(
      (run) => run['status'] === SyncRunStatus.SUCCESS
    ).length;
    const failedSyncs = totalSyncs - successfulSyncs;

    // Find consecutive failures (from most recent)
    let consecutiveFailures = 0;
    for (const run of syncRuns) {
      if (run['status'] === SyncRunStatus.FAILED) {
        consecutiveFailures++;
      } else {
        break;
      }
    }

    // Calculate average sync time
    const completedSyncs = syncRuns.filter(
      (run) => run['status'] === SyncRunStatus.SUCCESS && run['duration']
    );
    const averageSyncTime =
      completedSyncs.length > 0
        ? completedSyncs.reduce((sum, run) => sum + ((run['duration'] as number) || 0), 0) /
          completedSyncs.length
        : 0;

    // Get last successful and failed sync
    const lastSuccessfulSync = syncRuns.find(
      (run) => run['status'] === SyncRunStatus.SUCCESS
    );
    const lastFailedSync = syncRuns.find((run) => run['status'] === SyncRunStatus.FAILED);

    // Get error metrics (last 24 hours)
    const oneDayAgo = new Date();
    oneDayAgo.setHours(oneDayAgo.getHours() - 24);

    const recentErrors = syncRuns.filter((run) => {
      const startedAtTimestamp = run['startedAt'] as { toDate?: () => Date } | undefined;
      const startedAt = startedAtTimestamp?.toDate?.();
      return (
        startedAt &&
        startedAt >= oneDayAgo &&
        run['status'] === SyncRunStatus.FAILED &&
        run['errorMessage']
      );
    });

    const errorTypes: Record<string, number> = {};
    recentErrors.forEach((run) => {
      const errorMsg = (run['errorMessage'] as string) || 'Unknown error';
      // Categorize error
      const errorType = this.categorizeError(errorMsg);
      errorTypes[errorType] = (errorTypes[errorType] || 0) + 1;
    });

    const lastError = (lastFailedSync?.['errorMessage'] as string) || null;
    const lastErrorTimestamp = lastFailedSync?.['startedAt'] as
      | { toDate?: () => Date }
      | undefined;
    const lastErrorTime = lastErrorTimestamp?.toDate?.() || null;
    const errorFrequency = recentErrors.length;

    // Rate limit metrics (mock - would come from workspace metadata or API)
    // In a real implementation, this would be stored after each API call
    const rateLimitRequests = 0;
    const rateLimitRemaining = 1000; // Default Hostinger limit
    const rateLimitResetTime = null;
    const rateLimitPercentage = 0;

    // Circuit breaker status (based on consecutive failures)
    const circuitBreakerStatus: 'closed' | 'open' | 'half-open' =
      consecutiveFailures >= 5 ? CircuitBreakerStatus.OPEN : CircuitBreakerStatus.CLOSED;
    const circuitBreakerOpenedAt =
      circuitBreakerStatus === CircuitBreakerStatus.OPEN &&
      lastFailedSync?.['startedAt'] &&
      typeof (lastFailedSync['startedAt'] as FirebaseTimestamp | undefined)?.toDate === 'function'
        ? (lastFailedSync['startedAt'] as FirebaseTimestamp).toDate()
        : null;

    // Calculate health score
    const healthScore = HealthMetrics.calculateHealthScore({
      rateLimitPercentage,
      consecutiveFailures,
      errorFrequency,
      circuitBreakerStatus,
    });

    const healthStatus = HealthMetrics.getHealthStatusFromScore(healthScore);

    const metricsData: IHealthMetrics = {
      workspaceId,
      workspaceName,
      rateLimitRequests,
      rateLimitRemaining,
      rateLimitResetTime,
      rateLimitPercentage,
      lastSuccessfulSync:
        lastSuccessfulSync?.['startedAt'] &&
        typeof (lastSuccessfulSync['startedAt'] as FirebaseTimestamp | undefined)?.toDate ===
          'function'
          ? (lastSuccessfulSync['startedAt'] as FirebaseTimestamp).toDate()
          : null,
      lastFailedSync:
        lastFailedSync?.['startedAt'] &&
        typeof (lastFailedSync['startedAt'] as FirebaseTimestamp | undefined)?.toDate ===
          'function'
          ? (lastFailedSync['startedAt'] as FirebaseTimestamp).toDate()
          : null,
      consecutiveFailures,
      averageSyncTime,
      totalSyncs,
      successfulSyncs,
      failedSyncs,
      lastError,
      lastErrorTime,
      errorFrequency,
      errorTypes,
      circuitBreakerStatus,
      circuitBreakerOpenedAt,
      healthStatus,
      healthScore,
      lastUpdated: new Date(),
    };

    return new HealthMetrics(metricsData);
  }

  /**
   * Categorize error message into error type
   */
  private categorizeError(errorMessage: string): string {
    const lowerMsg = errorMessage.toLowerCase();

    if (lowerMsg.includes('rate limit') || lowerMsg.includes('too many requests')) {
      return 'Rate Limit';
    }
    if (lowerMsg.includes('auth') || lowerMsg.includes('unauthorized') || lowerMsg.includes('401')) {
      return 'Authentication';
    }
    if (lowerMsg.includes('network') || lowerMsg.includes('timeout') || lowerMsg.includes('econnrefused')) {
      return 'Network';
    }
    if (lowerMsg.includes('not found') || lowerMsg.includes('404')) {
      return 'Not Found';
    }
    if (lowerMsg.includes('server error') || lowerMsg.includes('500')) {
      return 'Server Error';
    }

    return 'Other';
  }

  /**
   * Get system-wide health summary
   */
  async getSystemHealthSummary(): Promise<SystemHealthSummary> {
    const metrics = await this.getAllHealthMetrics();

    const totalWorkspaces = metrics.length;
    const healthyWorkspaces = metrics.filter(
      (m) => m.healthStatus === HealthStatus.HEALTHY
    ).length;
    const warningWorkspaces = metrics.filter(
      (m) => m.healthStatus === HealthStatus.WARNING
    ).length;
    const criticalWorkspaces = metrics.filter(
      (m) => m.healthStatus === HealthStatus.CRITICAL
    ).length;

    const totalRateLimitUsage =
      totalWorkspaces > 0
        ? metrics.reduce((sum, m) => sum + m.rateLimitPercentage, 0) / totalWorkspaces
        : 0;

    const workspacesNearLimit = metrics.filter((m) => m.isNearRateLimit()).length;

    // Sync metrics for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalSyncsToday = metrics.reduce((sum, m) => {
      const todaySyncs = m.lastSuccessfulSync && m.lastSuccessfulSync >= today ? 1 : 0;
      return sum + todaySyncs;
    }, 0);

    const successfulSyncsToday = metrics.reduce((sum, m) => {
      const successToday =
        m.lastSuccessfulSync &&
        m.lastSuccessfulSync >= today &&
        (!m.lastFailedSync || m.lastSuccessfulSync > m.lastFailedSync)
          ? 1
          : 0;
      return sum + successToday;
    }, 0);

    const failedSyncsToday = totalSyncsToday - successfulSyncsToday;

    // Error metrics (last 24 hours)
    const totalErrors24h = metrics.reduce((sum, m) => sum + m.errorFrequency, 0);
    const workspacesWithErrors = metrics.filter((m) => m.errorFrequency > 0).length;

    const averageHealthScore =
      totalWorkspaces > 0
        ? metrics.reduce((sum, m) => sum + m.healthScore, 0) / totalWorkspaces
        : 100;

    const summaryData: ISystemHealthSummary = {
      totalWorkspaces,
      healthyWorkspaces,
      warningWorkspaces,
      criticalWorkspaces,
      totalRateLimitUsage,
      workspacesNearLimit,
      totalSyncsToday,
      successfulSyncsToday,
      failedSyncsToday,
      totalErrors24h,
      workspacesWithErrors,
      averageHealthScore,
      lastUpdated: new Date(),
    };

    const summary = new SystemHealthSummary(summaryData);
    this.systemSummary.set(summary);

    return summary;
  }

  /**
   * Refresh all health data
   */
  async refresh(): Promise<void> {
    await Promise.all([this.getAllHealthMetrics(), this.getSystemHealthSummary()]);
  }

  /**
   * Save health metrics history to Firestore
   */
  async saveHealthHistory(metrics: HealthMetrics[]): Promise<void> {
    try {
      const historyRef = collection(this.firestore, 'healthHistory');

      const batch: Promise<void>[] = [];

      for (const metric of metrics) {
        // History is now saved by Cloud Function for better performance
        // Use add() which returns a Promise
        const addPromise = getDocs(query(historyRef, where('workspaceId', '==', metric.workspaceId)))
          .then(() => {
            // Just resolve, actual add happens in Cloud Function
            return Promise.resolve();
          });

        batch.push(addPromise);
      }

      await Promise.all(batch);
    } catch (error: unknown) {
      console.error('[HealthService] Error saving health history:', error);
      throw error;
    }
  }

  /**
   * Get health history for a workspace
   */
  async getWorkspaceHistory(
    workspaceId: string,
    days = 7
  ): Promise<HealthHistory[]> {
    try {
      const historyRef = collection(this.firestore, 'healthHistory');
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const historyQuery = query(
        historyRef,
        where('workspaceId', '==', workspaceId),
        where('timestamp', '>=', Timestamp.fromDate(startDate)),
        orderBy('timestamp', 'desc')
      );

      const snapshot = await getDocs(historyQuery);

      return snapshot.docs.map((doc) => {
        const data = doc.data();
        return new HealthHistory({
          timestamp: (data['timestamp'] as FirebaseTimestamp).toDate(),
          workspaceId: data['workspaceId'] as string,
          healthScore: data['healthScore'] as number,
          rateLimitUsage: data['rateLimitUsage'] as number,
          syncSuccess: (data['syncSuccessRate'] as number) > 80,
          errorCount: data['errorCount'] as number,
        });
      });
    } catch (error: unknown) {
      console.error('[HealthService] Error fetching health history:', error);
      return [];
    }
  }

  /**
   * Detect and create proactive alerts for health issues
   */
  async detectAndCreateAlerts(): Promise<number> {
    const metrics = this.workspaceMetrics();
    let alertsCreated = 0;

    for (const metric of metrics) {
      // Alert for critical rate limit usage
      if (metric.hasCriticalRateLimit()) {
        await this.createHealthAlert(
          metric.workspaceId,
          metric.workspaceName,
          'critical',
          'Rate Limit Critical',
          `Rate limit usage at ${metric.rateLimitPercentage}%. Immediate action required.`
        );
        alertsCreated++;
      }

      // Alert for near rate limit
      else if (metric.isNearRateLimit()) {
        await this.createHealthAlert(
          metric.workspaceId,
          metric.workspaceName,
          'warning',
          'Rate Limit Warning',
          `Rate limit usage at ${metric.rateLimitPercentage}%. Consider reducing API calls.`
        );
        alertsCreated++;
      }

      // Alert for consecutive failures
      if (metric.hasConsecutiveFailures()) {
        await this.createHealthAlert(
          metric.workspaceId,
          metric.workspaceName,
          'critical',
          'Sync Failures Detected',
          `${metric.consecutiveFailures} consecutive sync failures. Check workspace configuration.`
        );
        alertsCreated++;
      }

      // Alert for circuit breaker open
      if (metric.isCircuitOpen()) {
        await this.createHealthAlert(
          metric.workspaceId,
          metric.workspaceName,
          'critical',
          'Circuit Breaker Open',
          `Circuit breaker has been triggered. Workspace syncs are paused.`
        );
        alertsCreated++;
      }

      // Alert for low health score
      if (metric.healthScore < 50 && metric.healthStatus === HealthStatus.CRITICAL) {
        await this.createHealthAlert(
          metric.workspaceId,
          metric.workspaceName,
          'critical',
          'Critical Health Status',
          `Health score is ${metric.healthScore}/100. Multiple issues detected.`
        );
        alertsCreated++;
      }
    }

    return alertsCreated;
  }

  /**
   * Create a health alert in Firestore
   */
  private async createHealthAlert(
    workspaceId: string,
    workspaceName: string,
    severity: 'warning' | 'critical',
    title: string,
    message: string
  ): Promise<void> {
    try {
      const alertsRef = collection(this.firestore, 'healthAlerts');

      // Check for duplicate alert (same workspace + title in last hour)
      const oneHourAgo = new Date();
      oneHourAgo.setHours(oneHourAgo.getHours() - 1);

      const duplicateQuery = query(
        alertsRef,
        where('workspaceId', '==', workspaceId),
        where('title', '==', title),
        where('createdAt', '>=', Timestamp.fromDate(oneHourAgo))
      );

      const duplicates = await getDocs(duplicateQuery);

      if (duplicates.size > 0) {
        return;
      }

      // Create new alert
      const alertData = {
        workspaceId,
        workspaceName,
        severity,
        title,
        message,
        isRead: false,
        createdAt: Timestamp.fromDate(new Date()),
      };

      // Persist alert to Firestore
      await addDoc(alertsRef, alertData);
    } catch (error: unknown) {
      console.error('[HealthService] Error creating health alert:', error);
    }
  }
}
