/* eslint-disable @typescript-eslint/no-explicit-any */
import { TestBed } from '@angular/core/testing';
import { WorkspaceService } from './workspace.service';
import { AuthService } from './auth.service';
import { EncryptionService } from './encryption.service';
import { HostingerApiService } from '@app/infrastructure/adapters/hostinger-api.service';
import { FirebaseAdapter } from '@app/infrastructure/adapters/firebase.adapter';
import { WorkspaceStatus } from '@app/domain';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { firstValueFrom } from 'rxjs';

// Mock Firestore functions
vi.mock('firebase/firestore', async () => {
  const actual = await vi.importActual('firebase/firestore');
  return {
    ...actual,
    collection: vi.fn(),
    addDoc: vi.fn(),
    updateDoc: vi.fn(),
    deleteDoc: vi.fn(),
    doc: vi.fn(),
    getDocs: vi.fn(),
    getDoc: vi.fn(),
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

describe('WorkspaceService', () => {
  let service: WorkspaceService;
  let authService: AuthService;
  let encryptionService: EncryptionService;
  let mockFirestore: any;

  const mockUserId = 'user-123';
  // mockWorkspaceData intentionally omitted (not used in tests)

  beforeEach(() => {
    // Mock Firestore instance
    mockFirestore = {
      collection: vi.fn(),
    };

    // Mock FirebaseAdapter
    vi.spyOn(FirebaseAdapter, 'getFirestore').mockReturnValue(mockFirestore as any);
    vi.spyOn(FirebaseAdapter, 'getAuth').mockReturnValue({} as any);

    TestBed.configureTestingModule({
      providers: [
        WorkspaceService,
        {
          provide: AuthService,
          useValue: {
            getCurrentUserUid: vi.fn().mockReturnValue(mockUserId),
          },
        },
        {
          provide: EncryptionService,
          useValue: {
            encrypt: vi.fn((text: string) => `encrypted_${text}`),
            decrypt: vi.fn((text: string) => text.replace('encrypted_', '')),
          },
        },
        {
          provide: HostingerApiService,
          useValue: {},
        },
      ],
    });

    service = TestBed.inject(WorkspaceService);
    authService = TestBed.inject(AuthService);
    encryptionService = TestBed.inject(EncryptionService);
  });

  describe('initialization', () => {
    it('should be created', () => {
      expect(service).toBeDefined();
    });

    it('should initialize with empty workspaces', () => {
      expect(service.workspaces()).toEqual([]);
    });

    it('should initialize with loading false', () => {
      expect(service.isLoading()).toBe(false);
    });

    it('should initialize with null error', () => {
      expect(service.error()).toBeNull();
    });
  });

  describe('getAllWorkspaces', () => {
    it('should fetch all workspaces for current user', async () => {
      const { getDocs, query, where, collection } = await import('firebase/firestore');
      const mockDocs = [
        {
          id: 'ws-1',
          data: () => ({
            name: 'Workspace 1',
            userId: mockUserId,
            status: WorkspaceStatus.ACTIVE,
            createdAt: { toDate: () => new Date('2024-01-01') },
            updatedAt: { toDate: () => new Date('2024-01-01') },
          }),
        },
        {
          id: 'ws-2',
          data: () => ({
            name: 'Workspace 2',
            userId: mockUserId,
            status: WorkspaceStatus.ACTIVE,
            createdAt: { toDate: () => new Date('2024-01-02') },
            updatedAt: { toDate: () => new Date('2024-01-02') },
          }),
        },
      ];

        vi.mocked(getDocs).mockResolvedValue({ docs: mockDocs } as any);
        vi.mocked(collection).mockReturnValue({} as any);
        vi.mocked(query).mockReturnValue({} as any);
        vi.mocked(where).mockReturnValue({} as any);

      const result = await service.getAllWorkspaces();

      expect(result).toHaveLength(2);
      expect(service.workspaces()).toHaveLength(2);
      expect(service.isLoading()).toBe(false);
      expect(service.error()).toBeNull();
    });

    it('should throw error when user not authenticated', async () => {
      vi.spyOn(authService, 'getCurrentUserUid').mockReturnValue(null);

      await expect(service.getAllWorkspaces()).rejects.toThrow('User not authenticated');
      expect(service.error()).toBe('User not authenticated');
    });

    it('should handle firestore errors', async () => {
      const { getDocs } = await import('firebase/firestore');
      const error = new Error('Firestore error');
      vi.mocked(getDocs).mockRejectedValue(error);

      await expect(service.getAllWorkspaces()).rejects.toThrow('Firestore error');
      expect(service.error()).toBe('Firestore error');
      expect(service.isLoading()).toBe(false);
    });

    it('should set loading state during fetch', async () => {
      const { getDocs } = await import('firebase/firestore');
      let loadingDuringFetch = false;

      vi.mocked(getDocs).mockImplementation(async () => {
        loadingDuringFetch = service.isLoading();
            return { docs: [] } as any;
      });

      await service.getAllWorkspaces();
      expect(loadingDuringFetch).toBe(true);
      expect(service.isLoading()).toBe(false);
    });
  });

  describe('getWorkspaceByIdAsync', () => {
    it('should fetch workspace by id', async () => {
      const { getDoc, doc } = await import('firebase/firestore');
      const mockDoc = {
        exists: () => true,
        id: 'ws-123',
        data: () => ({
          name: 'Test Workspace',
          userId: mockUserId,
          status: WorkspaceStatus.ACTIVE,
          createdAt: { toDate: () => new Date() },
          updatedAt: { toDate: () => new Date() },
        }),
      };

        vi.mocked(getDoc).mockResolvedValue(mockDoc as any);
        vi.mocked(doc).mockReturnValue({} as any);

      const result = await service.getWorkspaceByIdAsync('ws-123');

      expect(result).toBeDefined();
      expect(result?.id).toBe('ws-123');
      expect(result?.name).toBe('Test Workspace');
    });

    it('should return null when workspace not found', async () => {
      const { getDoc } = await import('firebase/firestore');
        vi.mocked(getDoc).mockResolvedValue({ exists: () => false } as any);

      const result = await service.getWorkspaceByIdAsync('nonexistent');

      expect(result).toBeNull();
    });

    it('should handle errors when fetching workspace', async () => {
      const { getDoc } = await import('firebase/firestore');
      const error = new Error('Database error');
      vi.mocked(getDoc).mockRejectedValue(error);

      await expect(service.getWorkspaceByIdAsync('ws-123')).rejects.toThrow('Database error');
      expect(service.error()).toBe('Database error');
    });
  });

  describe('getWorkspaceById', () => {
    it('should return observable that emits workspace', async () => {
      const { getDoc } = await import('firebase/firestore');
      const mockDoc = {
        exists: () => true,
        id: 'ws-123',
        data: () => ({
          name: 'Test Workspace',
          userId: mockUserId,
          status: WorkspaceStatus.ACTIVE,
          createdAt: { toDate: () => new Date() },
          updatedAt: { toDate: () => new Date() },
        }),
      };

      vi.mocked(getDoc).mockResolvedValue(mockDoc as any);

      const workspace = await firstValueFrom(service.getWorkspaceById('ws-123'));
      expect(workspace).toBeDefined();
      expect(workspace?.id).toBe('ws-123');
    });
  });

  describe('createWorkspace', () => {
    it('should create new workspace with encrypted token', async () => {
      const { addDoc, collection } = await import('firebase/firestore');
      const newWorkspaceData = {
        name: 'New Workspace',
        description: 'Description',
        status: WorkspaceStatus.ACTIVE,
        token: 'plain-token',
      };

        vi.mocked(addDoc).mockResolvedValue({ id: 'new-ws-id' } as any);
        vi.mocked(collection).mockReturnValue({} as any);

      const result = await service.createWorkspace(newWorkspaceData);

      expect(result).toBeDefined();
      expect(result.id).toBe('new-ws-id');
      expect(result.name).toBe('New Workspace');
      expect(encryptionService.encrypt).toHaveBeenCalledWith('plain-token');
      expect(service.workspaces()).toContain(result);
    });

    it('should throw error when user not authenticated', async () => {
      vi.spyOn(authService, 'getCurrentUserUid').mockReturnValue(null);

      await expect(
        service.createWorkspace({
          name: 'Test',
          description: '',
          status: WorkspaceStatus.ACTIVE,
        }),
      ).rejects.toThrow('User not authenticated');
    });

    it('should handle create errors', async () => {
      const { addDoc } = await import('firebase/firestore');
      const error = new Error('Create failed');
      vi.mocked(addDoc).mockRejectedValue(error);

      await expect(
        service.createWorkspace({
          name: 'Test',
          description: '',
          status: WorkspaceStatus.ACTIVE,
        }),
      ).rejects.toThrow('Create failed');
      expect(service.error()).toBe('Create failed');
    });
  });

  describe('updateWorkspace', () => {
    it('should update workspace', async () => {
      const { updateDoc, doc } = await import('firebase/firestore');
      vi.mocked(updateDoc).mockResolvedValue(undefined);
        vi.mocked(doc).mockReturnValue({} as any);

      await service.updateWorkspace('ws-123', { name: 'Updated Name' });

      expect(updateDoc).toHaveBeenCalled();
      expect(service.isLoading()).toBe(false);
    });

    it('should encrypt token when updating', async () => {
      const { updateDoc } = await import('firebase/firestore');
      vi.mocked(updateDoc).mockResolvedValue(undefined);

      await service.updateWorkspace('ws-123', { token: 'new-token' });

      expect(encryptionService.encrypt).toHaveBeenCalledWith('new-token');
    });

    it('should handle update errors', async () => {
      const { updateDoc } = await import('firebase/firestore');
      const error = new Error('Update failed');
      vi.mocked(updateDoc).mockRejectedValue(error);

      await expect(service.updateWorkspace('ws-123', { name: 'Updated' })).rejects.toThrow(
        'Update failed',
      );
      expect(service.error()).toBe('Update failed');
    });
  });

  describe('deleteWorkspace', () => {
    it('should delete workspace', async () => {
      const { deleteDoc, doc } = await import('firebase/firestore');
      vi.mocked(deleteDoc).mockResolvedValue(undefined);
        vi.mocked(doc).mockReturnValue({} as any);

      await service.deleteWorkspace('ws-123');

      expect(deleteDoc).toHaveBeenCalled();
      expect(service.isLoading()).toBe(false);
    });

    it('should handle delete errors', async () => {
      const { deleteDoc } = await import('firebase/firestore');
      const error = new Error('Delete failed');
      vi.mocked(deleteDoc).mockRejectedValue(error);

      await expect(service.deleteWorkspace('ws-123')).rejects.toThrow('Delete failed');
      expect(service.error()).toBe('Delete failed');
    });
  });

  describe('signals', () => {
    it('should update workspaces signal', async () => {
      const { getDocs } = await import('firebase/firestore');
        vi.mocked(getDocs).mockResolvedValue({ docs: [] } as any);

      expect(service.workspaces()).toEqual([]);

      await service.getAllWorkspaces();

      expect(service.workspaces()).toEqual([]);
    });

    it('should update error signal on failure', async () => {
      const { getDocs } = await import('firebase/firestore');
      vi.mocked(getDocs).mockRejectedValue(new Error('Test error'));

      try {
        await service.getAllWorkspaces();
      } catch {
        // Expected
      }

      expect(service.error()).toBe('Test error');
    });

    it('should clear error on successful operation', async () => {
      const { getDocs } = await import('firebase/firestore');

      // First fail
      vi.mocked(getDocs).mockRejectedValue(new Error('First error'));
      try {
        await service.getAllWorkspaces();
      } catch {
        // Expected
      }
      expect(service.error()).toBe('First error');

      // Then succeed
        vi.mocked(getDocs).mockResolvedValue({ docs: [] } as any);
      await service.getAllWorkspaces();

      expect(service.error()).toBeNull();
    });
  });
});
