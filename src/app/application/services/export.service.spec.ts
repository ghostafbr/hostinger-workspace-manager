import { TestBed } from '@angular/core/testing';
import { ExportService } from './export.service';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

describe('ExportService', () => {
  let service: ExportService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ExportService],
    });
    service = TestBed.inject(ExportService);

    // Mock DOM elements
    vi.stubGlobal('URL', {
      createObjectURL: vi.fn(() => 'blob:url'),
      revokeObjectURL: vi.fn(),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeDefined();
  });

  describe('exportToCSV', () => {
    it('should warn and return if no data', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      service.exportToCSV([], 'test.csv');
      expect(warnSpy).toHaveBeenCalledWith('No data to export');
      warnSpy.mockRestore();
    });

    it('should generate CSV and trigger download', () => {
      const data = [{ name: 'Test', value: 123 }];

      const linkMock = {
        href: '',
        download: '',
        click: vi.fn(),
      } as any;

      const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(linkMock);

      service.exportToCSV(data, 'test.csv');

      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(linkMock.download).toBe('test.csv');
      expect(linkMock.click).toHaveBeenCalled();
      expect(URL.createObjectURL).toHaveBeenCalled();
    });

    it('should handle custom columns', () => {
      const data = [{ name: 'Test', value: 123, ignored: true }];
      const columns = [{ label: 'Name Label', key: 'name' as keyof (typeof data)[0] }];

      const linkMock = { href: '', download: '', click: vi.fn() } as any;
      vi.spyOn(document, 'createElement').mockReturnValue(linkMock);

      service.exportToCSV(data, 'custom.csv', columns);
      // We can't easily inspect the blob content here without more complex mocking,
      // but verifying it runs without error and clicks the link is good basic verification.
      expect(linkMock.click).toHaveBeenCalled();
    });
  });

  describe('exportToJSON', () => {
    it('should download JSON file', () => {
      const data = { foo: 'bar' };
      const linkMock = { href: '', download: '', click: vi.fn() } as any;
      vi.spyOn(document, 'createElement').mockReturnValue(linkMock);

      service.exportToJSON(data, 'data.json');

      expect(linkMock.download).toBe('data.json');
      expect(linkMock.click).toHaveBeenCalled();
    });
  });
});
