import { TestBed } from '@angular/core/testing';
import { AlertService } from './alert.service';
import { FirebaseAdapter } from '@app/infrastructure/adapters/firebase.adapter';
import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('firebase/firestore', async () => {
  const actual = await vi.importActual('firebase/firestore');
  return {
    ...actual,
    collection: vi.fn(),
    getDocs: vi.fn(),
    addDoc: vi.fn(),
    query: vi.fn(),
    where: vi.fn(),
    orderBy: vi.fn(),
    limit: vi.fn(),
  };
});

describe('AlertService', () => {
  let service: AlertService;

  beforeEach(() => {
    vi.spyOn(FirebaseAdapter, 'getFirestore').mockReturnValue({} as any);

    TestBed.configureTestingModule({
      providers: [AlertService],
    });

    service = TestBed.inject(AlertService);
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

  describe('getAlertsByWorkspace', () => {
    it('should fetch alert logs for workspace', async () => {
      const { getDocs } = await import('firebase/firestore');
      const mockDocs = [
        {
          id: 'alert-1',
          data: () => ({
            workspaceId: 'ws-123',
            message: 'Domain expiring soon',
            sentAt: { toDate: () => new Date() },
            createdAt: { toDate: () => new Date() },
            processed: false,
          }),
        },
      ];

      vi.mocked(getDocs).mockResolvedValue({ docs: mockDocs } as any);

      const result = await service.getAlertsByWorkspace('ws-123');

      expect(result).toBeDefined();
      expect(result).toHaveLength(1);
      expect(service.isLoading()).toBe(false);
    });

    it('should handle firestore errors', async () => {
      const { getDocs } = await import('firebase/firestore');
      const error = new Error('Firestore error');
      vi.mocked(getDocs).mockRejectedValue(error);

      await expect(service.getAlertsByWorkspace('ws-123')).rejects.toThrow('Firestore error');
      expect(service.error()).toBe('Firestore error');
    });
  });
});
