/* eslint-disable @typescript-eslint/no-explicit-any */
import { TestBed } from '@angular/core/testing';
import { AlertService } from './alert.service';
import { FirebaseAdapter } from '@app/infrastructure/adapters/firebase.adapter';
import { ALERT_REPOSITORY, IAlertRepository } from '@app/domain/repositories/alert.repository';
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

    const mockAlertRepo: Partial<IAlertRepository> = {
      getAlertsByWorkspace: vi.fn().mockResolvedValue([]),
      getAlertsByEntity: vi.fn().mockResolvedValue([]),
      getCriticalAlerts: vi.fn().mockResolvedValue([]),
    };

    TestBed.configureTestingModule({
      providers: [AlertService, { provide: ALERT_REPOSITORY, useValue: mockAlertRepo }],
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
      const mockRepo = TestBed.inject(ALERT_REPOSITORY) as Partial<IAlertRepository>;
      vi.mocked(mockRepo.getAlertsByWorkspace!).mockResolvedValue([
        { id: 'alert-1' } as any,
      ] as any);

      const result = await service.getAlertsByWorkspace('ws-123');

      expect(result).toBeDefined();
      expect(result).toHaveLength(1);
      expect(service.isLoading()).toBe(false);
    });

    it('should handle firestore errors', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const mockRepo = TestBed.inject(ALERT_REPOSITORY) as Partial<IAlertRepository>;
      const error = new Error('Firestore error');
      vi.mocked(mockRepo.getAlertsByWorkspace!).mockRejectedValue(error);

      await expect(service.getAlertsByWorkspace('ws-123')).rejects.toThrow('Firestore error');
      expect(service.error()).toBe('Firestore error');
      consoleSpy.mockRestore();
    });
  });
});
