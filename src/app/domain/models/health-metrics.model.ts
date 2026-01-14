import type {
  HealthMetricsInterface,
  SystemHealthSummaryInterface,
  HealthHistoryInterface,
} from '../interfaces/health-metrics.interface';
import { HealthStatus, CircuitBreakerStatus } from '../enums/health-status.enum';

/**
 * Model for workspace health metrics with business logic
 */
export class HealthMetrics implements HealthMetricsInterface {
  workspaceId: string;
  workspaceName: string;

  rateLimitRequests: number;
  rateLimitRemaining: number;
  rateLimitResetTime: Date | null;
  rateLimitPercentage: number;

  lastSuccessfulSync: Date | null;
  lastFailedSync: Date | null;
  consecutiveFailures: number;
  averageSyncTime: number;
  totalSyncs: number;
  successfulSyncs: number;
  failedSyncs: number;

  lastError: string | null;
  lastErrorTime: Date | null;
  errorFrequency: number;
  errorTypes: Record<string, number>;

  circuitBreakerStatus: 'closed' | 'open' | 'half-open';
  circuitBreakerOpenedAt: Date | null;

  healthStatus: 'healthy' | 'warning' | 'critical';
  healthScore: number;

  lastUpdated: Date;

  constructor(data: HealthMetricsInterface) {
    this.workspaceId = data.workspaceId;
    this.workspaceName = data.workspaceName;

    this.rateLimitRequests = data.rateLimitRequests;
    this.rateLimitRemaining = data.rateLimitRemaining;
    this.rateLimitResetTime = data.rateLimitResetTime;
    this.rateLimitPercentage = data.rateLimitPercentage;

    this.lastSuccessfulSync = data.lastSuccessfulSync;
    this.lastFailedSync = data.lastFailedSync;
    this.consecutiveFailures = data.consecutiveFailures;
    this.averageSyncTime = data.averageSyncTime;
    this.totalSyncs = data.totalSyncs;
    this.successfulSyncs = data.successfulSyncs;
    this.failedSyncs = data.failedSyncs;

    this.lastError = data.lastError;
    this.lastErrorTime = data.lastErrorTime;
    this.errorFrequency = data.errorFrequency;
    this.errorTypes = data.errorTypes;

    this.circuitBreakerStatus = data.circuitBreakerStatus;
    this.circuitBreakerOpenedAt = data.circuitBreakerOpenedAt;

    this.healthStatus = data.healthStatus;
    this.healthScore = data.healthScore;

    this.lastUpdated = data.lastUpdated;
  }

  /**
   * Check if workspace is near rate limit (>80%)
   */
  isNearRateLimit(): boolean {
    return this.rateLimitPercentage >= 80;
  }

  /**
   * Check if workspace has critical rate limit usage (>90%)
   */
  hasCriticalRateLimit(): boolean {
    return this.rateLimitPercentage >= 90;
  }

  /**
   * Check if workspace has consecutive sync failures
   */
  hasConsecutiveFailures(): boolean {
    return this.consecutiveFailures >= 3;
  }

  /**
   * Check if circuit breaker is open
   */
  isCircuitOpen(): boolean {
    return this.circuitBreakerStatus === CircuitBreakerStatus.OPEN;
  }

  /**
   * Check if workspace is healthy
   */
  isHealthy(): boolean {
    return this.healthStatus === HealthStatus.HEALTHY;
  }

  /**
   * Check if workspace needs attention
   */
  needsAttention(): boolean {
    return (
      this.healthStatus === HealthStatus.WARNING || this.healthStatus === HealthStatus.CRITICAL
    );
  }

  /**
   * Get time until rate limit reset
   */
  getTimeUntilReset(): number | null {
    if (!this.rateLimitResetTime) return null;
    return this.rateLimitResetTime.getTime() - Date.now();
  }

  /**
   * Get sync success rate as percentage
   */
  getSyncSuccessRate(): number {
    if (this.totalSyncs === 0) return 100;
    return Math.round((this.successfulSyncs / this.totalSyncs) * 100);
  }

  /**
   * Get formatted average sync time
   */
  getFormattedSyncTime(): string {
    const seconds = Math.round(this.averageSyncTime / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  }

  /**
   * Get most common error type
   */
  getMostCommonError(): string | null {
    const entries = Object.entries(this.errorTypes);
    if (entries.length === 0) return null;

    const sorted = entries.sort((a, b) => b[1] - a[1]);
    return sorted[0][0];
  }

  /**
   * Calculate health score based on metrics (0-100)
   */
  static calculateHealthScore(metrics: Partial<HealthMetricsInterface>): number {
    let score = 100;

    // Rate limit impact (max -30 points)
    if (metrics.rateLimitPercentage !== undefined) {
      if (metrics.rateLimitPercentage >= 90) score -= 30;
      else if (metrics.rateLimitPercentage >= 80) score -= 20;
      else if (metrics.rateLimitPercentage >= 70) score -= 10;
    }

    // Consecutive failures impact (max -30 points)
    if (metrics.consecutiveFailures !== undefined) {
      score -= Math.min(metrics.consecutiveFailures * 10, 30);
    }

    // Error frequency impact (max -20 points)
    if (metrics.errorFrequency !== undefined) {
      score -= Math.min(metrics.errorFrequency * 2, 20);
    }

    // Circuit breaker impact (-20 points if open)
    if (metrics.circuitBreakerStatus === CircuitBreakerStatus.OPEN) {
      score -= 20;
    }

    return Math.max(0, score);
  }

  /**
   * Determine health status from score
   */
  static getHealthStatusFromScore(score: number): HealthStatus {
    if (score >= 80) return HealthStatus.HEALTHY;
    if (score >= 50) return HealthStatus.WARNING;
    return HealthStatus.CRITICAL;
  }
}

/**
 * Model for system health summary
 */
export class SystemHealthSummary implements SystemHealthSummaryInterface {
  totalWorkspaces: number;
  healthyWorkspaces: number;
  warningWorkspaces: number;
  criticalWorkspaces: number;

  totalRateLimitUsage: number;
  workspacesNearLimit: number;

  totalSyncsToday: number;
  successfulSyncsToday: number;
  failedSyncsToday: number;

  totalErrors24h: number;
  workspacesWithErrors: number;

  averageHealthScore: number;

  lastUpdated: Date;

  constructor(data: SystemHealthSummaryInterface) {
    this.totalWorkspaces = data.totalWorkspaces;
    this.healthyWorkspaces = data.healthyWorkspaces;
    this.warningWorkspaces = data.warningWorkspaces;
    this.criticalWorkspaces = data.criticalWorkspaces;

    this.totalRateLimitUsage = data.totalRateLimitUsage;
    this.workspacesNearLimit = data.workspacesNearLimit;

    this.totalSyncsToday = data.totalSyncsToday;
    this.successfulSyncsToday = data.successfulSyncsToday;
    this.failedSyncsToday = data.failedSyncsToday;

    this.totalErrors24h = data.totalErrors24h;
    this.workspacesWithErrors = data.workspacesWithErrors;

    this.averageHealthScore = data.averageHealthScore;

    this.lastUpdated = data.lastUpdated;
  }

  /**
   * Get sync success rate
   */
  getSyncSuccessRate(): number {
    if (this.totalSyncsToday === 0) return 100;
    return Math.round((this.successfulSyncsToday / this.totalSyncsToday) * 100);
  }

  /**
   * Check if system is healthy overall
   */
  isSystemHealthy(): boolean {
    return this.criticalWorkspaces === 0 && this.warningWorkspaces === 0;
  }

  /**
   * Get percentage of healthy workspaces
   */
  getHealthyPercentage(): number {
    if (this.totalWorkspaces === 0) return 100;
    return Math.round((this.healthyWorkspaces / this.totalWorkspaces) * 100);
  }
}

/**
 * Model for health history data point
 */
export class HealthHistory implements HealthHistoryInterface {
  timestamp: Date;
  workspaceId: string;
  healthScore: number;
  rateLimitUsage: number;
  syncSuccess: boolean;
  errorCount: number;

  constructor(data: HealthHistoryInterface) {
    this.timestamp = data.timestamp;
    this.workspaceId = data.workspaceId;
    this.healthScore = data.healthScore;
    this.rateLimitUsage = data.rateLimitUsage;
    this.syncSuccess = data.syncSuccess;
    this.errorCount = data.errorCount;
  }
}
