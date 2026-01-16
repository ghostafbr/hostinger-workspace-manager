/* eslint-disable @typescript-eslint/no-explicit-any */
import { TestBed } from '@angular/core/testing';
import { DashboardService } from './dashboard.service';
import { AuthService } from './auth.service';
import { FirebaseAdapter } from '@app/infrastructure/adapters/firebase.adapter';
import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('firebase/firestore', async () => {
  const actual = await vi.importActual('firebase/firestore');
  return {
    ...actual,
    collection: vi.fn(),
    getDocs: vi.fn(),
    query: vi.fn(),
    where: vi.fn(),
    Timestamp: {
      now: vi.fn(() => ({ seconds: 1640000000, nanoseconds: 0 })),
      fromDate: vi.fn((date: Date) => ({
        seconds: Math.floor(date.getTime() / 1000),
        nanoseconds: 0,
      })),
    },
  };
});

describe('DashboardService', () => {
  let service: DashboardService;
  let authService: AuthService;

  beforeEach(() => {
    vi.spyOn(FirebaseAdapter, 'getFirestore').mockReturnValue({} as any);

    TestBed.configureTestingModule({
      providers: [
        DashboardService,
        {
          provide: AuthService,
          useValue: {
            getCurrentUserUid: vi.fn().mockReturnValue('user-123'),
          },
        },
      ],
    });

    service = TestBed.inject(DashboardService);
    authService = TestBed.inject(AuthService);
  });

  describe('initialization', () => {
    it('should be created', () => {
      expect(service).toBeDefined();
    });

    it('should initialize with null stats', () => {
      expect(service.stats()).toBeNull();
    });

    it('should initialize with loading false', () => {
      expect(service.isLoading()).toBe(false);
    });

    it('should initialize with null error', () => {
      expect(service.error()).toBeNull();
    });
  });

  describe('loadDashboardStats', () => {
    it('should throw error when user not authenticated', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.spyOn(authService, 'getCurrentUserUid').mockReturnValue(null);

      await expect(service.loadDashboardStats()).rejects.toThrow('User not authenticated');
      expect(service.error()).toBe('User not authenticated');
      consoleSpy.mockRestore();
    });

    it('should return empty stats when no workspaces', async () => {
      const { getDocs } = await import('firebase/firestore');
      vi.mocked(getDocs).mockResolvedValue({ docs: [] } as any);

      const stats = await service.loadDashboardStats();

      expect(stats).toBeDefined();
      expect(stats.totalWorkspaces).toBe(0);
      expect(stats.totalDomains).toBe(0);
      expect(stats.totalSubscriptions).toBe(0);
      expect(service.isLoading()).toBe(false);
    });

    it('should handle firestore errors', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const { getDocs } = await import('firebase/firestore');
      const error = new Error('Firestore error');
      vi.mocked(getDocs).mockRejectedValue(error);

      await expect(service.loadDashboardStats()).rejects.toThrow('Firestore error');
      expect(service.error()).toBe('Firestore error');
      expect(service.isLoading()).toBe(false);
      consoleSpy.mockRestore();
    });

    it('should set loading state during fetch', async () => {
      const { getDocs } = await import('firebase/firestore');
      let loadingDuringFetch = false;

      vi.mocked(getDocs).mockImplementation(async () => {
        loadingDuringFetch = service.isLoading();
        return { docs: [] } as any;
      });

      await service.loadDashboardStats();
      expect(loadingDuringFetch).toBe(true);
      expect(service.isLoading()).toBe(false);
    });
  });

  describe('signals', () => {
    it('should update stats signal', async () => {
      const { getDocs } = await import('firebase/firestore');
      vi.mocked(getDocs).mockResolvedValue({ docs: [] } as any);

      await service.loadDashboardStats();

      expect(service.stats()).not.toBeNull();
    });

    it('should clear error on successful operation', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const { getDocs } = await import('firebase/firestore');

      // First fail
      vi.mocked(getDocs).mockRejectedValue(new Error('First error'));
      try {
        await service.loadDashboardStats();
      } catch {
        // Expected
      }
      expect(service.error()).toBe('First error');

      // Then succeed
      vi.mocked(getDocs).mockResolvedValue({ docs: [] } as any);
      await service.loadDashboardStats();

      expect(service.error()).toBeNull();
      consoleSpy.mockRestore();
    });
  });
});
