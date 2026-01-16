/* eslint-disable @typescript-eslint/no-explicit-any */
import { TestBed } from '@angular/core/testing';
import { EmailService } from './email.service';
import { FirebaseAdapter } from '@app/infrastructure';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { Timestamp } from 'firebase/firestore';

vi.mock('firebase/firestore', async () => {
  const actual = await vi.importActual('firebase/firestore');
  return {
    ...actual,
    collection: vi.fn(),
    doc: vi.fn(),
    getDocs: vi.fn(),
    addDoc: vi.fn(),
    updateDoc: vi.fn(),
    deleteDoc: vi.fn(),
    query: vi.fn(),
    where: vi.fn(),
    orderBy: vi.fn(),
    Timestamp: {
      now: vi.fn(() => ({ seconds: 1640000000, nanoseconds: 0, toDate: () => new Date(1640000000000) })),
      fromDate: vi.fn((date: Date) => ({
        seconds: Math.floor(date.getTime() / 1000),
        nanoseconds: 0,
        toDate: () => date
      })),
    },
  };
});

describe('EmailService', () => {
  let service: EmailService;

  beforeEach(() => {
    vi.spyOn(FirebaseAdapter, 'getFirestore').mockReturnValue({} as any);

    TestBed.configureTestingModule({
      providers: [EmailService],
    });

    service = TestBed.inject(EmailService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initialization', () => {
    it('should be created', () => {
      expect(service).toBeDefined();
    });
  });

  describe('getEmailConfig', () => {
    it('should return config when exists', async () => {
      const { getDocs } = await import('firebase/firestore');
      const mockSnap = {
        empty: false,
        docs: [
          {
            id: 'config-1',
            data: () => ({ workspaceId: 'ws-1', enabled: true }),
          },
        ],
      };
      vi.mocked(getDocs).mockResolvedValue(mockSnap as any);

      const config = await service.getEmailConfig('ws-1');
      expect(config).toBeDefined();
      expect(config?.id).toBe('config-1');
      expect(config?.enabled).toBe(true);
    });

    it('should return null when no config exists', async () => {
      const { getDocs } = await import('firebase/firestore');
      const mockSnap = { empty: true, docs: [] };
      vi.mocked(getDocs).mockResolvedValue(mockSnap as any);

      const config = await service.getEmailConfig('ws-1');
      expect(config).toBeNull();
    });

    it('should handle errors', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const { getDocs } = await import('firebase/firestore');
      vi.mocked(getDocs).mockRejectedValue(new Error('Fetch failed'));

      await expect(service.getEmailConfig('ws-1')).rejects.toThrow('Fetch failed');
      expect(service.error()).toContain('Fetch failed');
      consoleSpy.mockRestore();
    });
  });

  describe('createEmailConfig', () => {
    it('should create config if not exists', async () => {
      const { addDoc, getDocs } = await import('firebase/firestore');
      // Mock getEmailConfig returning null (not exists)
      vi.mocked(getDocs).mockResolvedValue({ empty: true, docs: [] } as any);
      vi.mocked(addDoc).mockResolvedValue({ id: 'new-id' } as any);

      const id = await service.createEmailConfig({ workspaceId: 'ws-1', enabled: true } as any);
      expect(id).toBe('new-id');
    });

    it('should throw if config already exists', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const { getDocs } = await import('firebase/firestore');
      // Mock getEmailConfig returning result
      vi.mocked(getDocs).mockResolvedValue({
        empty: false,
        docs: [{ id: 'exist', data: () => ({}) }],
      } as any);

      await expect(
        service.createEmailConfig({ workspaceId: 'ws-1', enabled: true } as any)
      ).rejects.toThrow('already exists');
      consoleSpy.mockRestore();
    });
  });

  describe('updateEmailConfig', () => {
    it('should update existing config', async () => {
      const { updateDoc, getDocs } = await import('firebase/firestore');
      // Mock existing config
      vi.mocked(getDocs).mockResolvedValue({
        empty: false,
        docs: [{ id: 'config-1', data: () => ({ workspaceId: 'ws-1' }) }],
      } as any);
      vi.mocked(updateDoc).mockResolvedValue(undefined);

      await service.updateEmailConfig('ws-1', { enabled: false });
      expect(updateDoc).toHaveBeenCalled();
    });

    it('should throw if config not found', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const { getDocs } = await import('firebase/firestore');
      vi.mocked(getDocs).mockResolvedValue({ empty: true, docs: [] } as any);

      await expect(service.updateEmailConfig('ws-1', {})).rejects.toThrow('not found');
      consoleSpy.mockRestore();
    });
  });

  describe('deleteEmailConfig', () => {
    it('should delete existing config', async () => {
      const { deleteDoc, getDocs } = await import('firebase/firestore');
       vi.mocked(getDocs).mockResolvedValue({
        empty: false,
        docs: [{ id: 'config-1', data: () => ({}) }],
      } as any);
      vi.mocked(deleteDoc).mockResolvedValue(undefined);

      await service.deleteEmailConfig('ws-1');
      expect(deleteDoc).toHaveBeenCalled();
    });
  });

  describe('getEmailLogs', () => {
    it('should return logs', async () => {
      const { getDocs } = await import('firebase/firestore');
      const mockDocs = [{ id: 'log-1', data: () => ({ status: 'sent' }) }];
      vi.mocked(getDocs).mockResolvedValue({ docs: mockDocs } as any);

      const logs = await service.getEmailLogs('ws-1');
      expect(logs).toHaveLength(1);
      expect(logs[0].id).toBe('log-1');
    });
  });

  describe('createEmailLog', () => {
    it('should create log', async () => {
      const { addDoc } = await import('firebase/firestore');
      vi.mocked(addDoc).mockResolvedValue({ id: 'log-new' } as any);

      const id = await service.createEmailLog({ status: 'pending' } as any);
      expect(id).toBe('log-new');
    });
  });

  describe('updateEmailLog', () => {
    it('should update log', async () => {
      const { updateDoc } = await import('firebase/firestore');
      vi.mocked(updateDoc).mockResolvedValue(undefined);

      await service.updateEmailLog('log-1', { status: 'sent' });
      expect(updateDoc).toHaveBeenCalled();
    });
  });

  describe('checkRateLimits', () => {
    it('should return false if no config', async () => {
        const { getDocs } = await import('firebase/firestore');
        vi.mocked(getDocs).mockResolvedValue({ empty: true, docs: [] } as any); // getEmailConfig -> null

        const result = await service.checkRateLimits('ws-1');
        expect(result.canSend).toBe(false);
    });

    it('should check limits against logs', async () => {
        const { getDocs } = await import('firebase/firestore');
        // 1. getEmailConfig returns config
        const configSnap = {
            empty: false,
            docs: [{ id: 'c', data: () => ({ rateLimit: { maxPerHour: 10, maxPerDay: 50 } }) }]
        };

        // 2. getEmailLogs returns logs
        const logsSnap = {
            docs: [
                { id: 'l1', data: () => ({ sentAt: { toDate: () => new Date() } }) }, // just now
                { id: 'l2', data: () => ({ sentAt: { toDate: () => new Date(Date.now() - 10000) } }) } 
            ]
        };

        // We need to carefully mock sequential calls to getDocs?
        // Actually getEmailConfig calls getDocs(query(config)).
        // getEmailLogs calls getDocs(query(logs)).
        // Simplified: use mockImplementation to return based on some hint or just assume order if sequential.
        
        let callCount = 0;
        vi.mocked(getDocs).mockImplementation(async () => {
            callCount++;
            if (callCount === 1) return configSnap as any;
            return logsSnap as any;
        });

        const result = await service.checkRateLimits('ws-1');
        expect(result.canSend).toBe(true);
        expect(result.hourlyCount).toBe(2);
    });
  });
});
