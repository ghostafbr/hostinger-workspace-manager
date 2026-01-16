/* eslint-disable @typescript-eslint/no-explicit-any */
import { TestBed } from '@angular/core/testing';
import { SnapshotService } from './snapshot.service';
import { DashboardService } from './dashboard.service';
import { AuthService } from './auth.service';
import { FirebaseAdapter } from '@app/infrastructure/adapters/firebase.adapter';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

vi.mock('firebase/firestore', async () => {
  const actual = await vi.importActual('firebase/firestore');
  return {
    ...actual,
    collection: vi.fn(),
    addDoc: vi.fn(),
    getDocs: vi.fn(),
    query: vi.fn(),
    where: vi.fn(),
    orderBy: vi.fn(),
    limit: vi.fn(),
    serverTimestamp: vi.fn(),
    deleteDoc: vi.fn(),
    Timestamp: {
      fromDate: vi.fn(),
    },
  };
});

describe('SnapshotService', () => {
  let service: SnapshotService;
  let dashboardService: DashboardService;

  beforeEach(() => {
    vi.spyOn(FirebaseAdapter, 'getFirestore').mockReturnValue({} as any);

    TestBed.configureTestingModule({
      providers: [
        SnapshotService,
        {
          provide: AuthService,
          useValue: { getCurrentUserUid: vi.fn().mockReturnValue('u1') },
        },
        {
          provide: DashboardService,
          useValue: { loadDashboardStats: vi.fn() },
        },
      ],
    });

    service = TestBed.inject(SnapshotService);
    dashboardService = TestBed.inject(DashboardService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('createSnapshot', () => {
    it('should create snapshot from stats', async () => {
      const { addDoc } = await import('firebase/firestore');
      vi.mocked(dashboardService.loadDashboardStats).mockResolvedValue({
        totalWorkspaces: 10,
        workspacesInError: [],
        activeWorkspaces: 5,
        totalDomains: 2,
        totalSubscriptions: 2,
        domainsExpiring7Days: 0,
        domainsExpiring15Days: 0,
        domainsExpiring30Days: 0,
        domainsExpiring60Days: 0,
        subscriptionsExpiring7Days: 0,
        subscriptionsExpiring15Days: 0,
        subscriptionsExpiring30Days: 0,
        subscriptionsExpiring60Days: 0,
      } as any);

      vi.mocked(addDoc).mockResolvedValue({ id: 'snap-1' } as any);
      vi.spyOn(service, 'loadSnapshots').mockResolvedValue([]); // Prevent failing on load

      const id = await service.createSnapshot();
      expect(id).toBe('snap-1');
      expect(dashboardService.loadDashboardStats).toHaveBeenCalled();
    });
  });

  describe('loadSnapshots', () => {
    it('should load snapshots', async () => {
      const { getDocs } = await import('firebase/firestore');
      const mockDocs = [{ id: 's1', data: () => ({ totalWorkspaces: 5 }) }];
      vi.mocked(getDocs).mockResolvedValue({ docs: mockDocs } as any);

      const snaps = await service.loadSnapshots();
      expect(snaps).toHaveLength(1);
    });
  });

  describe('getChangeMetrics', () => {
    it('should calculate diffs', () => {
      const curr = {
        totalWorkspaces: 10,
        totalDomains: 5,
        totalSubscriptions: 2,
        domainsExpiring7Days: 1,
      } as any;
      const prev = {
        totalWorkspaces: 8,
        totalDomains: 5,
        totalSubscriptions: 3,
        domainsExpiring7Days: 0,
      } as any;

      const diff = service.getChangeMetrics(curr, prev);
      expect(diff.workspaceChange).toBe(2);
      expect(diff.domainChange).toBe(0);
      expect(diff.subscriptionChange).toBe(-1);
    });
  });
});
