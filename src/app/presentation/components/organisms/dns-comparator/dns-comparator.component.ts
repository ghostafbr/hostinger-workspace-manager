import { Component, ChangeDetectionStrategy, inject, input, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { SkeletonModule } from 'primeng/skeleton';
import { DnsService } from '@app/application';
import { DnsRecord } from '@app/domain';

interface ComparisonResult {
  added: DnsRecord[];
  removed: DnsRecord[];
  modified: DnsRecord[];
}

/**
 * DNS Comparator Component
 *
 * Compares current DNS configuration with previous snapshots
 */
@Component({
  selector: 'app-dns-comparator',

  imports: [
    FormsModule,
    CardModule,
    ButtonModule,
    TableModule,
    TagModule,
    DividerModule,
    SkeletonModule,
  ],
  templateUrl: './dns-comparator.component.html',
  styleUrl: './dns-comparator.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DnsComparatorComponent {
  private readonly dnsService = inject(DnsService);

  // Inputs
  domainName = input.required<string>();

  // Local signals
  selectedSnapshotId = signal<string | null>(null);
  comparison = signal<ComparisonResult | null>(null);

  // Computed from service
  snapshots = computed(() => this.dnsService.snapshots());
  isLoading = computed(() => this.dnsService.isLoading());

  // Dropdown options
  snapshotOptions = computed(() =>
    this.snapshots().map((s) => ({
      label: `${s.createdAt.toDate().toLocaleString()} - ${s.note || 'Manual snapshot'}`,
      value: s.id,
    })),
  );

  /**
   * Load snapshots on init
   */
  async ngOnInit(): Promise<void> {
    await this.loadSnapshots();
  }

  /**
   * Load snapshots for domain
   */
  async loadSnapshots(): Promise<void> {
    try {
      await this.dnsService.getSnapshotsByDomain(this.domainName());
    } catch (error: unknown) {
      console.error('Error loading snapshots:', error);
    }
  }

  /**
   * Handle snapshot selection
   */
  onSnapshotSelect(snapshotId: string): void {
    this.selectedSnapshotId.set(snapshotId);
    this.compareWithSnapshot(snapshotId);
  }

  /**
   * Compare current records with selected snapshot
   */
  compareWithSnapshot(snapshotId: string): void {
    const result = this.dnsService.compareWithSnapshot(snapshotId);
    this.comparison.set(result);
  }

  /**
   * Create a new snapshot
   */
  async createSnapshot(): Promise<void> {
    try {
      const note = `Manual snapshot - ${new Date().toLocaleString()}`;
      await this.dnsService.createSnapshot(this.domainName(), note);
    } catch (error: unknown) {
      console.error('Error creating snapshot:', error);
    }
  }

  /**
   * Get total changes count
   */
  getTotalChanges(): number {
    const comp = this.comparison();
    if (!comp) return 0;
    return comp.added.length + comp.removed.length + comp.modified.length;
  }

  /**
   * Track by function
   */
  trackById(_index: number, record: DnsRecord): string {
    return record.id;
  }
}
