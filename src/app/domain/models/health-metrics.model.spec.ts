import { describe, it, expect } from 'vitest';
import { HealthMetrics, SystemHealthSummary, HealthHistory } from './health-metrics.model';
import { CircuitBreakerStatus, HealthStatus } from '../enums/health-status.enum';

describe('HealthMetrics', () => {
  it('calcula score y estados correctamente (variantes)', () => {
    const m = new HealthMetrics({
      workspaceId: 'w',
      workspaceName: 'ws',
      rateLimitRequests: 100,
      rateLimitRemaining: 10,
      rateLimitResetTime: null,
      rateLimitPercentage: 85,
      lastSuccessfulSync: null,
      lastFailedSync: null,
      consecutiveFailures: 2,
      averageSyncTime: 2000,
      totalSyncs: 10,
      successfulSyncs: 8,
      failedSyncs: 2,
      lastError: null,
      lastErrorTime: null,
      errorFrequency: 1,
      errorTypes: { TypeA: 2 },
      circuitBreakerStatus: 'closed',
      circuitBreakerOpenedAt: null,
      healthStatus: 'warning',
      healthScore: 60,
      lastUpdated: new Date(),
    });

    expect(m.isNearRateLimit()).toBe(true);
    expect(m.hasCriticalRateLimit()).toBe(false);
    expect(m.hasConsecutiveFailures()).toBe(false);
    expect(m.isCircuitOpen()).toBe(false);
    expect(m.needsAttention()).toBe(true);
    expect(m.getSyncSuccessRate()).toBe(80);
    expect(m.getMostCommonError()).toBe('TypeA');

    // calculateHealthScore simple case
    expect(HealthMetrics.calculateHealthScore({ rateLimitPercentage: 95 })).toBe(70);

    // combined impacts
    const combined = HealthMetrics.calculateHealthScore({
      rateLimitPercentage: 85,
      consecutiveFailures: 3,
      errorFrequency: 5,
      circuitBreakerStatus: CircuitBreakerStatus.OPEN,
    });
    expect(combined).toBe(20);
    expect(HealthMetrics.getHealthStatusFromScore(85)).toBe(HealthStatus.HEALTHY);
    expect(HealthMetrics.getHealthStatusFromScore(75)).toBe(HealthStatus.WARNING);
    expect(HealthMetrics.getHealthStatusFromScore(40)).toBe(HealthStatus.CRITICAL);
  });

  it('formatea tiempo de sync y calcula tiempo hasta reset (variantes)', () => {
    const short = new HealthMetrics({
      workspaceId: 'w',
      workspaceName: 'ws',
      rateLimitRequests: 100,
      rateLimitRemaining: 100,
      rateLimitResetTime: null,
      rateLimitPercentage: 10,
      lastSuccessfulSync: null,
      lastFailedSync: null,
      consecutiveFailures: 0,
      averageSyncTime: 30000, // 30s
      totalSyncs: 0,
      successfulSyncs: 0,
      failedSyncs: 0,
      lastError: null,
      lastErrorTime: null,
      errorFrequency: 0,
      errorTypes: {},
      circuitBreakerStatus: 'closed',
      circuitBreakerOpenedAt: null,
      healthStatus: 'healthy',
      healthScore: 100,
      lastUpdated: new Date(),
    });

    expect(short.getFormattedSyncTime()).toBe('30s');
    expect(short.getSyncSuccessRate()).toBe(100);

    const long = new HealthMetrics({
      workspaceId: 'w',
      workspaceName: 'ws',
      rateLimitRequests: 100,
      rateLimitRemaining: 0,
      rateLimitResetTime: new Date(Date.now() + 65000),
      rateLimitPercentage: 95,
      lastSuccessfulSync: null,
      lastFailedSync: null,
      consecutiveFailures: 4,
      averageSyncTime: 125000, // 2m 5s
      totalSyncs: 2,
      successfulSyncs: 1,
      failedSyncs: 1,
      lastError: null,
      lastErrorTime: null,
      errorFrequency: 5,
      errorTypes: {},
      circuitBreakerStatus: 'open',
      circuitBreakerOpenedAt: new Date(),
      healthStatus: 'critical',
      healthScore: 10,
      lastUpdated: new Date(),
    });

    expect(long.getFormattedSyncTime()).toMatch(/m/);
    const until = long.getTimeUntilReset();
    expect(typeof until).toBe('number');
    expect(until).toBeGreaterThan(0);
  });
});

describe('SystemHealthSummary', () => {
  it('calcula tasas correctamente', () => {
    const s = new SystemHealthSummary({
      totalWorkspaces: 10,
      healthyWorkspaces: 8,
      warningWorkspaces: 1,
      criticalWorkspaces: 1,
      totalRateLimitUsage: 0,
      workspacesNearLimit: 0,
      totalSyncsToday: 10,
      successfulSyncsToday: 9,
      failedSyncsToday: 1,
      totalErrors24h: 0,
      workspacesWithErrors: 0,
      averageHealthScore: 80,
      lastUpdated: new Date(),
    });

    expect(s.getSyncSuccessRate()).toBe(90);
    expect(s.isSystemHealthy()).toBe(false);
    expect(s.getHealthyPercentage()).toBe(80);
  });

    it('maneja casos frontera en SystemHealthSummary', () => {
      const zero = new SystemHealthSummary({
        totalWorkspaces: 0,
        healthyWorkspaces: 0,
        warningWorkspaces: 0,
        criticalWorkspaces: 0,
        totalRateLimitUsage: 0,
        workspacesNearLimit: 0,
        totalSyncsToday: 0,
        successfulSyncsToday: 0,
        failedSyncsToday: 0,
        totalErrors24h: 0,
        workspacesWithErrors: 0,
        averageHealthScore: 100,
        lastUpdated: new Date(),
      });

      expect(zero.getSyncSuccessRate()).toBe(100);
      expect(zero.isSystemHealthy()).toBe(true);
      expect(zero.getHealthyPercentage()).toBe(100);
    });
  });

  describe('HealthHistory', () => {
    it('construye correctamente un punto de historial', () => {
      const now = new Date();
      const h = new HealthHistory({
        timestamp: now,
        workspaceId: 'w',
        healthScore: 80,
        rateLimitUsage: 10,
        syncSuccess: true,
        errorCount: 0,
      });

      expect(h.timestamp).toBe(now);
      expect(h.workspaceId).toBe('w');
      expect(h.healthScore).toBe(80);
    });
  });
// end of health-metrics.model.spec.ts
