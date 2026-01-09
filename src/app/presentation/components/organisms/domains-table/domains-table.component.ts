import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  computed,
  signal,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';

// Domain
import { IDomain } from '@app/domain';

// Components
import { ExpirationSemaphoreComponent } from '../../molecules/expiration-semaphore/expiration-semaphore.component';

/**
 * Days Filter Option
 */
interface DaysFilterOption {
  label: string;
  value: number | null;
}

/**
 * Domains Table Component
 *
 * Filterable, searchable, paginated table for domains
 */
@Component({
  selector: 'app-domains-table',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    FormsModule,
    TableModule,
    InputTextModule,
    ButtonModule,
    SelectModule,
    TagModule,
    IconFieldModule,
    InputIconModule,
    ExpirationSemaphoreComponent,
  ],
  templateUrl: './domains-table.component.html',
  styleUrl: './domains-table.component.scss',
})
export class DomainsTableComponent {
  readonly domains = input.required<IDomain[]>();
  readonly isLoading = input<boolean>(false);
  readonly totalRecords = input<number>(0);

  readonly domainClicked = output<IDomain>();
  readonly pageChanged = output<{ first: number; rows: number }>();

  // Local state
  readonly searchText = signal<string>('');
  readonly selectedDaysFilter = signal<number | null>(null);

  // Filter options
  readonly daysFilterOptions: DaysFilterOption[] = [
    { label: 'Todos', value: null },
    { label: '< 7 días', value: 7 },
    { label: '< 15 días', value: 15 },
    { label: '< 30 días', value: 30 },
    { label: '< 60 días', value: 60 },
    { label: '< 90 días', value: 90 },
  ];

  /**
   * Filtered domains (client-side filtering)
   */
  readonly filteredDomains = computed(() => {
    let result = this.domains();

    // Search filter
    const search = this.searchText().toLowerCase();
    if (search) {
      result = result.filter((d) => d.domainName?.toLowerCase().includes(search));
    }

    // Days filter
    const daysFilter = this.selectedDaysFilter();
    if (daysFilter !== null) {
      const threshold = new Date();
      threshold.setDate(threshold.getDate() + daysFilter);

      result = result.filter((d) => {
        const expiresAt = this.toDate(d.expiresAt);
        return expiresAt && expiresAt <= threshold;
      });
    }

    return result;
  });

  /**
   * Handle search input
   */
  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchText.set(value);
  }

  /**
   * Handle days filter change
   */
  onDaysFilterChange(value: number | null): void {
    this.selectedDaysFilter.set(value);
  }

  /**
   * Handle domain row click
   */
  onDomainClick(domain: IDomain): void {
    this.domainClicked.emit(domain);
  }

  /**
   * Get privacy/lock status tag severity
   */
  getPrivacyLockSeverity(enabled: boolean): 'success' | 'secondary' {
    return enabled ? 'success' : 'secondary';
  }

  /**
   * Format nameservers for display
   */
  formatNameservers(nameservers: string[] | undefined): string {
    if (!nameservers || nameservers.length === 0) return 'N/A';
    return nameservers.join(', ');
  }

  /**
   * Convert timestamp to Date
   */
  private toDate(timestamp: unknown): Date | null {
    if (!timestamp) return null;
    if (timestamp instanceof Date) return timestamp;
    if (typeof timestamp === 'string') return new Date(timestamp);
    if (typeof timestamp === 'object' && 'toDate' in timestamp) {
      return (timestamp as { toDate: () => Date }).toDate();
    }
    if (typeof timestamp === 'object' && 'seconds' in timestamp) {
      return new Date((timestamp as { seconds: number }).seconds * 1000);
    }
    return null;
  }
}
