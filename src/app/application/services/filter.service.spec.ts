/* eslint-disable @typescript-eslint/no-explicit-any */
import { TestBed } from '@angular/core/testing';
import { FilterService } from './filter.service';
import { AuthService } from './auth.service';
import { FirebaseAdapter } from '@app/infrastructure/adapters/firebase.adapter';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WorkspaceStatus } from '@app/domain';

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
    serverTimestamp: vi.fn().mockReturnValue('timestamp'),
  };
});

describe('FilterService', () => {
  let service: FilterService;
  let authService: AuthService;

  beforeEach(() => {
    vi.spyOn(FirebaseAdapter, 'getFirestore').mockReturnValue({} as any);

    TestBed.configureTestingModule({
      providers: [
        FilterService,
        {
          provide: AuthService,
          useValue: {
            getCurrentUserUid: vi.fn().mockReturnValue('user-1'),
          },
        },
      ],
    });

    service = TestBed.inject(FilterService);
    authService = TestBed.inject(AuthService);
  });

  describe('initialization', () => {
    it('should be created', () => {
      expect(service).toBeDefined();
    });
  });

  describe('loadSavedFilters', () => {
    it('should load filters', async () => {
      const { getDocs } = await import('firebase/firestore');
      const mockDocs = [{ id: 'f1', data: () => ({ name: 'Filter 1' }) }];
      vi.mocked(getDocs).mockResolvedValue({ docs: mockDocs } as any);

      const filters = await service.loadSavedFilters();
      expect(filters).toHaveLength(1);
      expect(filters[0].id).toBe('f1');
    });

    it('should throw if no user', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.spyOn(authService, 'getCurrentUserUid').mockReturnValue(null);
      await expect(service.loadSavedFilters()).rejects.toThrow('User not authenticated');
      consoleSpy.mockRestore();
    });
  });

  describe('saveFilter', () => {
    it('should save new filter', async () => {
      const { addDoc } = await import('firebase/firestore');
      vi.mocked(addDoc).mockResolvedValue({ id: 'new-f' } as any);
      
      // Mock load reload
      vi.spyOn(service, 'loadSavedFilters').mockResolvedValue([]);

      const id = await service.saveFilter('My Filter', {});
      expect(id).toBe('new-f');
    });
  });

  describe('applyFilter', () => {
    const workspaces: any[] = [
        { name: 'Alpha', status: WorkspaceStatus.ACTIVE, isFavorite: true, tags: ['prod'] },
        { name: 'Beta', status: WorkspaceStatus.DISABLED, isFavorite: false, tags: ['dev'] },
    ];

    it('should filter by name', () => {
      const result = service.applyFilter(workspaces, { name: 'alpha' });
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Alpha');
    });

    it('should filter by status', () => {
        const result = service.applyFilter(workspaces, { status: [WorkspaceStatus.DISABLED] });
        expect(result).toHaveLength(1);
        expect(result[0].name).toBe('Beta');
    });

    it('should filter by favorites', () => {
        const result = service.applyFilter(workspaces, { favoritesOnly: true });
        expect(result).toHaveLength(1);
        expect(result[0].name).toBe('Alpha');
    });

    it('should filter by tags', () => {
        const result = service.applyFilter(workspaces, { tags: ['dev'] });
        expect(result).toHaveLength(1);
        expect(result[0].name).toBe('Beta');
    });
  });
});
