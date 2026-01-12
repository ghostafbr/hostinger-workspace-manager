/**
 * Interface for workspace health metrics
 */
export interface HealthMetricsInterface {
  workspaceId: string;
  workspaceName: string;

  // Rate Limit Metrics
  rateLimitRequests: number;
  rateLimitRemaining: number;
  rateLimitResetTime: Date | null;
  rateLimitPercentage: number; // % used

  // Sync Metrics
  lastSuccessfulSync: Date | null;
  lastFailedSync: Date | null;
  consecutiveFailures: number;
  averageSyncTime: number; // in milliseconds
  totalSyncs: number;
  successfulSyncs: number;
  failedSyncs: number;

  // Error Metrics
  lastError: string | null;
  lastErrorTime: Date | null;
  errorFrequency: number; // errors per day
  errorTypes: Record<string, number>; // error type → count

  // Circuit Breaker Status
  circuitBreakerStatus: 'closed' | 'open' | 'half-open';
  circuitBreakerOpenedAt: Date | null;

  // Health Status
  healthStatus: 'healthy' | 'warning' | 'critical';
  healthScore: number; // 0-100

  // Timestamps
  lastUpdated: Date;
}

/**
 * Interface for system-wide health summary
 */
export interface SystemHealthSummaryInterface {
  totalWorkspaces: number;
  healthyWorkspaces: number;
  warningWorkspaces: number;
  criticalWorkspaces: number;

  totalRateLimitUsage: number; // average %
  workspacesNearLimit: number; // > 80% usage

  totalSyncsToday: number;
  successfulSyncsToday: number;
  failedSyncsToday: number;

  totalErrors24h: number;
  workspacesWithErrors: number;

  averageHealthScore: number;

  lastUpdated: Date;
}

/**
 * Interface for health history data point
 */
export interface HealthHistoryInterface {
  timestamp: Date;
  workspaceId: string;
  healthScore: number;
  rateLimitUsage: number;
  syncSuccess: boolean;
  errorCount: number;
}
