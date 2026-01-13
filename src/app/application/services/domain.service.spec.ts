import { TestBed } from '@angular/core/testing';
import { DomainService } from './domain.service';
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
    startAfter: vi.fn(),
    doc: vi.fn(),
    getDoc: vi.fn(),
    updateDoc: vi.fn(),
  };
});

describe('DomainService', () => {
  let service: DomainService;

  beforeEach(() => {
    vi.spyOn(FirebaseAdapter, 'getFirestore').mockReturnValue({} as any);

    TestBed.configureTestingModule({
      providers: [DomainService],
    });

    service = TestBed.inject(DomainService);
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

  describe('getDomains', () => {
    it('should fetch domains for workspace', async () => {
      const { getDocs } = await import('firebase/firestore');
      const mockDocs = [
        {
          id: 'domain-1',
          data: () => ({
            domainName: 'example.com',
            workspaceId: 'ws-123',
            expiresAt: { toDate: () => new Date('2025-12-31') },
          }),
        },
      ];

      vi.mocked(getDocs).mockResolvedValue({ docs: mockDocs } as any);

      const result = await service.getDomains({ workspaceId: 'ws-123' });

      expect(result).toBeDefined();
      expect(result.domains).toHaveLength(1);
      expect(result.domains[0].domainName).toBe('example.com');
      expect(service.isLoading()).toBe(false);
    });

    it('should handle firestore errors', async () => {
      const { getDocs } = await import('firebase/firestore');
      const error = new Error('Firestore error');
      vi.mocked(getDocs).mockRejectedValue(error);

      await expect(service.getDomains({ workspaceId: 'ws-123' })).rejects.toThrow('Firestore error');
      expect(service.error()).toBe('Firestore error');
    });

    it('should set loading state during fetch', async () => {
      const { getDocs } = await import('firebase/firestore');
      let loadingDuringFetch = false;

      vi.mocked(getDocs).mockImplementation(async () => {
        loadingDuringFetch = service.isLoading();
        return { docs: [] } as any;
      });

      await service.getDomains({ workspaceId: 'ws-123' });
      expect(loadingDuringFetch).toBe(true);
      expect(service.isLoading()).toBe(false);
    });
  });
});
