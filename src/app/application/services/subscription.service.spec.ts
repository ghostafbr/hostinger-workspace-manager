import { TestBed } from '@angular/core/testing';
import { SubscriptionService } from './subscription.service';
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

describe('SubscriptionService', () => {
  let service: SubscriptionService;

  beforeEach(() => {
    vi.spyOn(FirebaseAdapter, 'getFirestore').mockReturnValue({} as any);

    TestBed.configureTestingModule({
      providers: [SubscriptionService],
    });

    service = TestBed.inject(SubscriptionService);
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

  describe('getSubscriptions', () => {
    it('should fetch subscriptions for workspace', async () => {
      const { getDocs } = await import('firebase/firestore');
      const mockDocs = [
        {
          id: 'sub-1',
          data: () => ({
            productName: 'VPS Hosting',
            workspaceId: 'ws-123',
            expiresAt: { toDate: () => new Date('2025-12-31') },
          }),
        },
      ];

      vi.mocked(getDocs).mockResolvedValue({ docs: mockDocs } as any);

      const result = await service.getSubscriptions({ workspaceId: 'ws-123' });

      expect(result).toBeDefined();
      expect(result).toHaveLength(1);
      expect(result[0].productName).toBe('VPS Hosting');
      expect(service.isLoading()).toBe(false);
    });

    it('should handle firestore errors', async () => {
      const { getDocs } = await import('firebase/firestore');
      const error = new Error('Firestore error');
      vi.mocked(getDocs).mockRejectedValue(error);

      await expect(service.getSubscriptions({ workspaceId: 'ws-123' })).rejects.toThrow('Firestore error');
      expect(service.error()).toBe('Firestore error');
    });
  });
});
