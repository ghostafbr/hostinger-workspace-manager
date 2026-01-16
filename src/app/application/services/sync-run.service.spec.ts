/* eslint-disable @typescript-eslint/no-explicit-any */
import { TestBed } from '@angular/core/testing';
import { SyncRunService } from './sync-run.service';
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
    orderBy: vi.fn(),
    limit: vi.fn(),
  };
});

describe('SyncRunService', () => {
  let service: SyncRunService;

  beforeEach(() => {
    vi.spyOn(FirebaseAdapter, 'getFirestore').mockReturnValue({} as any);

    TestBed.configureTestingModule({
      providers: [SyncRunService],
    });

    service = TestBed.inject(SyncRunService);
  });

  describe('initialization', () => {
    it('should be created', () => {
      expect(service).toBeDefined();
    });

    it('should initialize with loading false', () => {
      expect(service.isLoading()).toBe(false);
    });

    it('should initialize with null error', () => {
      expect(service.error()).toBeNull();
    });
  });

  describe('getSyncRunsByWorkspace', () => {
    it('should fetch sync runs for workspace', async () => {
      const { getDocs } = await import('firebase/firestore');
      const mockDocs = [
        {
          id: 'run-1',
          data: () => ({
            workspaceId: 'ws-123',
            status: 'SUCCESS',
            startedAt: { toDate: () => new Date() },
            completedAt: { toDate: () => new Date() },
          }),
        },
      ];

      vi.mocked(getDocs).mockResolvedValue({ docs: mockDocs } as any);

      const result = await service.getSyncRunsByWorkspace('ws-123');

      expect(result).toBeDefined();
      expect(result).toHaveLength(1);
      expect(service.isLoading()).toBe(false);
    });

    it('should handle firestore errors', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const { getDocs } = await import('firebase/firestore');
      const error = new Error('Firestore error');
      vi.mocked(getDocs).mockRejectedValue(error);

      await expect(service.getSyncRunsByWorkspace('ws-123')).rejects.toThrow('Firestore error');
      expect(service.error()).not.toBeNull();
      consoleSpy.mockRestore();
    });
  });
});
