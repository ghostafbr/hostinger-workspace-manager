import { TestBed } from '@angular/core/testing';
import { DnsService } from './dns.service';
import { WorkspaceContextService } from './workspace-context.service';
import { DnsRecordType } from '@app/domain';

describe('DnsService', () => {
  let service: DnsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DnsService, WorkspaceContextService],
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
      expect(filtered).toEqual(service.dnsRecords());
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
});
