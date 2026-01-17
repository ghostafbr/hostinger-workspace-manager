import { Component, ChangeDetectionStrategy, inject, input, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MultiSelectModule } from 'primeng/multiselect';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { SkeletonModule } from 'primeng/skeleton';
import { DividerModule } from 'primeng/divider';
import { DnsService } from '@app/application';
import { DnsRecord, DnsRecordType } from '@app/domain';

/**
 * DNS Viewer Component
 *
 * Displays DNS records for a domain with filtering capabilities
 */
@Component({
  selector: 'app-dns-viewer',

  imports: [
    FormsModule,
    TableModule,
    ButtonModule,
    CardModule,
    MultiSelectModule,
    TagModule,
    TooltipModule,
    SkeletonModule,
    DividerModule,
  ],
  templateUrl: './dns-viewer.component.html',
  styleUrl: './dns-viewer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DnsViewerComponent {
  private readonly dnsService = inject(DnsService);

  // Inputs
  domainName = input.required<string>();

  // Local signals
  selectedTypes = signal<DnsRecordType[]>([]);

  // Computed from service signals
  records = computed(() => this.dnsService.filteredRecords());
  isLoading = computed(() => this.dnsService.isLoading());
  error = computed(() => this.dnsService.error());
  recordCounts = computed(() => this.dnsService.getRecordCountByType());

  // Available record types for filter
  readonly availableTypes = [
    { label: 'A (IPv4)', value: DnsRecordType.A },
    { label: 'AAAA (IPv6)', value: DnsRecordType.AAAA },
    { label: 'CNAME (Alias)', value: DnsRecordType.CNAME },
    { label: 'MX (Mail)', value: DnsRecordType.MX },
    { label: 'TXT (Text)', value: DnsRecordType.TXT },
    { label: 'NS (Name Server)', value: DnsRecordType.NS },
    { label: 'SOA (Authority)', value: DnsRecordType.SOA },
    { label: 'SRV (Service)', value: DnsRecordType.SRV },
    { label: 'PTR (Pointer)', value: DnsRecordType.PTR },
  ];

  /**
   * Load DNS records on component initialization
   */
  async ngOnInit(): Promise<void> {
    await this.loadDnsRecords();
  }

  /**
   * Load DNS records from service
   */
  async loadDnsRecords(): Promise<void> {
    try {
      await this.dnsService.getDnsRecordsByDomain(this.domainName());
    } catch (error: unknown) {
      console.error('Error loading DNS records:', error);
    }
  }

  /**
   * Handle filter change
   */
  onFilterChange(types: DnsRecordType[]): void {
    this.selectedTypes.set(types);
    this.dnsService.filterByRecordTypes(types);
  }

  /**
   * Clear all filters
   */
  clearFilters(): void {
    this.selectedTypes.set([]);
    this.dnsService.clearFilters();
  }

  /**
   * Refresh DNS records
   */
  async refresh(): Promise<void> {
    await this.loadDnsRecords();
  }

  /**
   * Get severity color for record type tag
   */
  getTypeSeverity(type: DnsRecordType): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    switch (type) {
      case DnsRecordType.A:
      case DnsRecordType.AAAA:
        return 'success';
      case DnsRecordType.MX:
        return 'warn';
      case DnsRecordType.TXT:
        return 'info';
      case DnsRecordType.CNAME:
        return 'secondary';
      default:
        return 'secondary';
    }
  }

  /**
   * Get icon for record type
   */
  getTypeIcon(type: DnsRecordType): string {
    switch (type) {
      case DnsRecordType.A:
      case DnsRecordType.AAAA:
        return 'pi pi-globe';
      case DnsRecordType.MX:
        return 'pi pi-envelope';
      case DnsRecordType.TXT:
        return 'pi pi-file';
      case DnsRecordType.CNAME:
        return 'pi pi-link';
      case DnsRecordType.NS:
        return 'pi pi-server';
      default:
        return 'pi pi-tag';
    }
  }

  /**
   * Track by function for performance
   */
  trackByRecordId(_index: number, record: DnsRecord): string {
    return record.id;
  }
}
