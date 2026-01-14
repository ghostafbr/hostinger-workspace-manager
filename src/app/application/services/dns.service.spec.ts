import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DnsService } from './dns.service';
import { WorkspaceContextService } from './workspace-context.service';
import { DnsRecordType } from '@app/domain';
import { vi } from 'vitest';
import { computed, signal } from '@angular/core';

// Mock Firebase Adapter BEFORE importing service
vi.mock('@app/infrastructure/adapters/firebase.adapter', () => ({
  FirebaseAdapter: {
    getFirestore: vi.fn(() => ({})),
    getAuth: vi.fn(() => ({})),
    getFunctions: vi.fn(() => ({})),
  },
}));

// Mock firebase/functions
vi.mock('firebase/functions', () => ({
  httpsCallable: vi.fn(() => vi.fn()),
}));

describe('DnsService', () => {
  let service: DnsService;

  // Mock WorkspaceContextService
  const workspaceContextSpy = {
    workspaceId: signal('test-workspace-id'),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DnsService, { provide: WorkspaceContextService, useValue: workspaceContextSpy }],
    });

    service = TestBed.inject(DnsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Signal State Management', () => {
    it('should initialize with empty arrays', () => {
      expect(service.dnsRecords()).toEqual([]);
      expect(service.snapshots()).toEqual([]);
      expect(service.filteredRecords()).toEqual([]);
    });

    it('should initialize isLoading as false', () => {
      expect(service.isLoading()).toBe(false);
    });

    it('should initialize error as null', () => {
      expect(service.error()).toBe(null);
    });

    it('should initialize selectedDomain as null', () => {
      expect(service.selectedDomain()).toBe(null);
    });

    it('should initialize selectedRecordTypes as empty array', () => {
      expect(service.selectedRecordTypes()).toEqual([]);
    });
  });

  describe('clearState', () => {
    it('should reset all signals to initial values', () => {
      // Set some values first
      service.dnsRecords.set([]);
      service.snapshots.set([]);
      service.filteredRecords.set([]);
      service.selectedDomain.set('example.com');
      service.selectedRecordTypes.set([DnsRecordType.A]);
      service.error.set('Test error');

      // Clear state
      service.clearState();

      // Verify reset
      expect(service.dnsRecords()).toEqual([]);
      expect(service.snapshots()).toEqual([]);
      expect(service.filteredRecords()).toEqual([]);
      expect(service.selectedDomain()).toBe(null);
      expect(service.selectedRecordTypes()).toEqual([]);
      expect(service.error()).toBe(null);
    });
  });

  describe('filterByRecordTypes', () => {
    it('should set filteredRecords to all records when types array is empty', () => {
      service.clearFilters();
      const filtered = service.filteredRecords();
      expect(filtered).toEqual(service.dnsRecords()); // Should equal (by reference/content)
    });
  });

  describe('clearFilters', () => {
    it('should reset selectedRecordTypes to empty array', () => {
      service.selectedRecordTypes.set([DnsRecordType.A, DnsRecordType.MX]);
      service.clearFilters();
      expect(service.selectedRecordTypes()).toEqual([]);
    });

    it('should set filteredRecords to match dnsRecords', () => {
      service.clearFilters();
      expect(service.filteredRecords()).toEqual(service.dnsRecords());
    });
  });

  describe('getRecordCountByType', () => {
    it('should return empty Map when no records', () => {
      const counts = service.getRecordCountByType();
      expect(counts.size).toBe(0);
    });
  });

  describe('validateDns', () => {
    it('should call cloud function and update validationResults signal', async () => {
      const mockResult = {
        id: '123',
        status: 'healthy',
        checks: [],
      };
      // Mock httpsCallable return value
      const httpsCallableMock = vi.mocked(await import('firebase/functions')).httpsCallable;
      const callableReturn = vi.fn().mockResolvedValue({ data: mockResult }) as any;
      httpsCallableMock.mockReturnValue(callableReturn);

      await service.validateDns('example.com');

      expect(httpsCallableMock).toHaveBeenCalled();
      expect(service.validationResults()).toEqual(mockResult);
      expect(service.isLoading()).toBe(false);
    });
  });
});
