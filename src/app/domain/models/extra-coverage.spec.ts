import { describe, it, expect } from 'vitest';
import { HealthMetrics } from './health-metrics.model';
import { Workspace } from './workspace.model';
import { CircuitBreakerStatus, HealthStatus } from '../enums/health-status.enum';
import { WorkspaceStatus } from '../enums/workspace-status.enum';

describe('Extra coverage for domain models', () => {
  it('HealthMetrics.calculateHealthScore covers edge branches', () => {
    // no rateLimitPercentage -> no penalty
    expect(HealthMetrics.calculateHealthScore({})).toBe(100);

    // boundary at 70
    expect(HealthMetrics.calculateHealthScore({ rateLimitPercentage: 70 })).toBe(90);

    // consecutiveFailures cap at 30 -> 100 - min(5*10,30) = 70
    expect(HealthMetrics.calculateHealthScore({ consecutiveFailures: 5 })).toBe(70);

    // errorFrequency cap at 20
    expect(HealthMetrics.calculateHealthScore({ errorFrequency: 20 })).toBe(80);

    // circuit breaker open
    expect(
      HealthMetrics.calculateHealthScore({ circuitBreakerStatus: CircuitBreakerStatus.OPEN }),
    ).toBe(80);

    // combined effects cannot go below 0
    expect(
      HealthMetrics.calculateHealthScore({
        rateLimitPercentage: 95,
        consecutiveFailures: 5,
        errorFrequency: 20,
        circuitBreakerStatus: CircuitBreakerStatus.OPEN,
      }),
    ).toBeGreaterThanOrEqual(0);
  });

  it('HealthMetrics.getTimeUntilReset and getMostCommonError edge cases', () => {
    const now = new Date();
    const hm = new HealthMetrics({
      workspaceId: 'w',
      workspaceName: 'ws',
      rateLimitRequests: 100,
      rateLimitRemaining: 10,
      rateLimitResetTime: new Date(Date.now() + 1000),
      rateLimitPercentage: 50,
      lastSuccessfulSync: null,
      lastFailedSync: null,
      consecutiveFailures: 0,
      averageSyncTime: 1000,
      totalSyncs: 1,
      successfulSyncs: 1,
      failedSyncs: 0,
      lastError: null,
      lastErrorTime: null,
      errorFrequency: 0,
      errorTypes: { A: 2, B: 1 },
      circuitBreakerStatus: 'closed',
      circuitBreakerOpenedAt: null,
      healthStatus: 'healthy',
      healthScore: 90,
      lastUpdated: now,
    });

    const until = hm.getTimeUntilReset();
    expect(typeof until === 'number').toBe(true);
    expect(hm.getMostCommonError()).toBe('A');
  });

  it('Workspace.getStatusMessage default case', () => {
    const base: any = {
      id: 'x',
      name: 'x',
      userId: 'u',
      status: 'UNKNOWN',
      createdAt: new Date() as unknown,
      updatedAt: new Date() as unknown,
    };

    const w = new Workspace(base);
    expect(w.getStatusMessage()).toBe('Unknown');
  });
});
