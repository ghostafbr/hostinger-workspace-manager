/* eslint-disable @typescript-eslint/no-explicit-any */
import { TestBed } from '@angular/core/testing';
import { HealthService } from './health.service';
import { FirebaseAdapter } from '@app/infrastructure/adapters/firebase.adapter';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { SyncRunStatus, HealthStatus, CircuitBreakerStatus } from '@app/domain';

vi.mock('firebase/firestore', async () => {
  const actual = await vi.importActual('firebase/firestore');
  return {
    ...actual,
    collection: vi.fn(),
    doc: vi.fn(),
    getDocs: vi.fn(),
    addDoc: vi.fn(),
    query: vi.fn(),
    where: vi.fn(),
    orderBy: vi.fn(),
    Timestamp: {
      now: vi.fn(() => ({ toDate: () => new Date() })),
      fromDate: vi.fn((date: Date) => ({ toDate: () => date })),
    },
  };
});

describe('HealthService', () => {
  let service: HealthService;

  beforeEach(() => {
    vi.spyOn(FirebaseAdapter, 'getFirestore').mockReturnValue({} as any);

    TestBed.configureTestingModule({
      providers: [HealthService],
    });

    service = TestBed.inject(HealthService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getAllHealthMetrics', () => {
    it('should calculate metrics for workspaces', async () => {
      const { getDocs } = await import('firebase/firestore');

      // 1. Workspaces
      const workspacesSnap = {
        docs: [{ id: 'w1', data: () => ({ name: 'WS 1' }) }],
      };

      // 2. Sync runs (mock return for calculateWorkspaceMetrics)
      const syncRunsSnap = {
        docs: [
          {
            id: 'r1',
            data: () => ({
              status: SyncRunStatus.SUCCESS,
              duration: 1000,
              startedAt: { toDate: () => new Date() },
            }),
          },
          {
            id: 'r2',
            data: () => ({
              status: SyncRunStatus.FAILED,
              errorMessage: 'Timeout',
              startedAt: { toDate: () => new Date() },
            }),
          },
        ],
      };

      let callCount = 0;
      vi.mocked(getDocs).mockImplementation(async () => {
        callCount++;
        if (callCount === 1) return workspacesSnap as any;
        return syncRunsSnap as any;
      });

      const metrics = await service.getAllHealthMetrics();

      expect(metrics).toHaveLength(1);
      expect(metrics[0].workspaceId).toBe('w1');
      expect(metrics[0].totalSyncs).toBe(2);
      expect(metrics[0].successfulSyncs).toBe(1);
      expect(metrics[0].failedSyncs).toBe(1);
      expect(metrics[0].averageSyncTime).toBe(1000);
    });

    it('should handle errors', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const { getDocs } = await import('firebase/firestore');
      vi.mocked(getDocs).mockRejectedValue(new Error('Fail'));

      await expect(service.getAllHealthMetrics()).rejects.toThrow('Fail');
      consoleSpy.mockRestore();
    });
  });

  describe('logic', () => {
    it('should calculate circuit breaker status correctly', async () => {
      const { getDocs } = await import('firebase/firestore');

      // Mock 5 consecutive failures
      const failures = Array(5)
        .fill(null)
        .map((_, i) => ({
          id: `f${i}`,
          data: () => ({
            status: SyncRunStatus.FAILED,
            errorMessage: 'Error',
            startedAt: { toDate: () => new Date() },
          }),
        }));

      vi.mocked(getDocs).mockResolvedValue({ docs: failures } as any);

      const metric = await service.getWorkspaceHealth('w1', 'Test');
      expect(metric.circuitBreakerStatus).toBe(CircuitBreakerStatus.OPEN);
      expect(metric.healthStatus).toBe(HealthStatus.CRITICAL);
    });
  });

  describe('detectAndCreateAlerts', () => {
    it('should create alerts for issues', async () => {
      const { addDoc, getDocs } = await import('firebase/firestore');

      // Create mock metric with issues manually or implicitly via workspaceMetrics signal
      // But workspaceMetrics is updated via getAllHealthMetrics.
      // Or we can just spy on signal? No, easier to run getAllHealthMetrics mock first.

      // Mock getting metrics that have issues
      const workspacesSnap = { docs: [{ id: 'w1', data: () => ({ name: 'WS 1' }) }] };
      const syncRunsSnap = {
        // 5 fails
        docs: Array(5)
          .fill(null)
          .map((_, i) => ({
            id: `f${i}`,
            data: () => ({ status: SyncRunStatus.FAILED, startedAt: { toDate: () => new Date() } }),
          })),
      };

      vi.mocked(getDocs).mockImplementation(async (q: any) => {
        // Very rough check if it's the workspaces query or sync runs
        // Real implementation mocks would check query params
        // Here assuming order for simplicity again or just responding generously

        // Actually detectAndCreateAlerts calls createHealthAlert which calls getDocs to check duplicates.
        // We need to distinguish:
        // 1. Workspaces
        // 2. SyncRuns
        // 3. Duplicates check (return empty)
        return syncRunsSnap as any;
      });

      vi.spyOn(service, 'getAllHealthMetrics').mockResolvedValue([
        {
          workspaceId: 'w1',
          workspaceName: 'WS 1',
          hasConsecutiveFailures: () => true, // Force true
          isNearRateLimit: () => false,
          hasCriticalRateLimit: () => false,
          isCircuitOpen: () => true, // Force true
          healthStatus: HealthStatus.CRITICAL,
          healthScore: 40,
          consecutiveFailures: 5,
          rateLimitPercentage: 0,
          errorFrequency: 5,
        } as any,
      ]);

      service.workspaceMetrics.set([
        {
          workspaceId: 'w1',
          workspaceName: 'WS 1',
          hasConsecutiveFailures: () => true, // Force true
          isNearRateLimit: () => false,
          hasCriticalRateLimit: () => false,
          isCircuitOpen: () => true, // Force true
          healthStatus: HealthStatus.CRITICAL,
          healthScore: 40,
          consecutiveFailures: 5,
          rateLimitPercentage: 0,
          errorFrequency: 5,
        } as any,
      ]);

      // Mock checking duplicates logic: createHealthAlert calls getDocs
      vi.mocked(getDocs).mockResolvedValue({ size: 0, docs: [] } as any);

      const count = await service.detectAndCreateAlerts();
      expect(count).toBeGreaterThan(0);
      expect(addDoc).toHaveBeenCalled();
    });
  });
});
