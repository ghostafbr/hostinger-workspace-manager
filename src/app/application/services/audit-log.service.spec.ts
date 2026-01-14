import { TestBed } from '@angular/core/testing';
import { AuditLogService } from './audit-log.service';
import { AuthService } from './auth.service';
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
    Timestamp: {
      now: vi.fn(() => ({ seconds: 1640000000, nanoseconds: 0 })),
    },
  };
});

describe('AuditLogService', () => {
  let service: AuditLogService;

  beforeEach(() => {
    vi.spyOn(FirebaseAdapter, 'getFirestore').mockReturnValue({} as any);

    TestBed.configureTestingModule({
      providers: [
        AuditLogService,
        {
          provide: AuthService,
          useValue: {
            getCurrentUserUid: vi.fn().mockReturnValue('user-123'),
            getCurrentUserEmail: vi.fn().mockReturnValue('test@example.com'),
          },
        },
      ],
    });

    service = TestBed.inject(AuditLogService);
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

  describe('getAuditLogs', () => {
    it('should fetch audit logs for workspace', async () => {
      const { getDocs } = await import('firebase/firestore');
      const mockDocs = [
        {
          id: 'log-1',
          data: () => ({
            action: 'CREATE',
            entityType: 'WORKSPACE',
            workspaceId: 'ws-123',
            actorUid: 'user-123',
            actorEmail: 'test@example.com',
            status: 'SUCCESS',
            createdAt: { toDate: () => new Date() },
          }),
        },
      ];

      vi.mocked(getDocs).mockResolvedValue({ docs: mockDocs } as any);

      const result = await service.getAuditLogs({ workspaceId: 'ws-123' });

      expect(result).toBeDefined();
      expect(result).toHaveLength(1);
      expect(service.isLoading()).toBe(false);
    });

    it('should handle firestore errors', async () => {
      const { getDocs } = await import('firebase/firestore');
      const error = new Error('Firestore error');
      vi.mocked(getDocs).mockRejectedValue(error);

      await expect(service.getAuditLogs({ workspaceId: 'ws-123' })).rejects.toThrow(
        'Firestore error',
      );
      expect(service.error()).toBe('Firestore error');
    });

    it('should fetch all audit logs without filters', async () => {
      const { getDocs } = await import('firebase/firestore');
      vi.mocked(getDocs).mockResolvedValue({ docs: [] } as any);

      const result = await service.getAuditLogs();

      expect(result).toBeDefined();
      expect(result).toHaveLength(0);
    });
  });
});
