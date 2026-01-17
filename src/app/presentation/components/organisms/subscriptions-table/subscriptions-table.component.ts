import { Component, ChangeDetectionStrategy, input, output, signal, computed } from '@angular/core';
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
import { ToggleButtonModule } from 'primeng/togglebutton';

// Domain
import { Subscription as ISubscription } from '@app/domain/interfaces/subscription.interface';

// Components
import { ExpirationSemaphoreComponent } from '../../molecules/expiration-semaphore/expiration-semaphore.component';

/**
 * Subscriptions Table Component
 *
 * Displays a filterable, searchable, paginated table of subscriptions
 */
@Component({
  selector: 'app-subscriptions-table',

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
    ToggleButtonModule,
    ExpirationSemaphoreComponent,
  ],
  templateUrl: './subscriptions-table.component.html',
  styleUrl: './subscriptions-table.component.scss',
})
export class SubscriptionsTableComponent {
  readonly subscriptions = input.required<ISubscription[]>();
  readonly isLoading = input<boolean>(false);
  readonly totalRecords = input<number>(0);

  readonly subscriptionClicked = output<ISubscription>();

  readonly searchText = signal<string>('');
  readonly selectedAutoRenewFilter = signal<boolean | null>(null);
  readonly rowsPerPage = signal<number>(10);

  /**
   * Auto-renew filter options
   */
  readonly autoRenewFilterOptions = [
    { label: 'Todas', value: null },
    { label: 'Solo Auto-Renew', value: true },
    { label: 'Sin Auto-Renew', value: false },
  ];

  /**
   * Filtered subscriptions based on search and filters
   */
  readonly filteredSubscriptions = computed(() => {
    let result = [...this.subscriptions()];

    // Search filter
    const search = this.searchText().toLowerCase();
    if (search) {
      result = result.filter((s) => s.productName?.toLowerCase().includes(search));
    }

    // Auto-renew filter
    const autoRenewFilter = this.selectedAutoRenewFilter();
    if (autoRenewFilter !== null) {
      result = result.filter((s) => s.autoRenew === autoRenewFilter);
    }

    return result;
  });

  /**
   * Handle subscription row click
   */
  onRowClick(subscription: ISubscription): void {
    this.subscriptionClicked.emit(subscription);
  }

  /**
   * Handle auto-renew filter change
   */
  onAutoRenewFilterChange(value: boolean | null): void {
    this.selectedAutoRenewFilter.set(value);
  }

  /**
   * Get status severity for tags
   */
  getStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('active') || statusLower.includes('activ')) return 'success';
    if (statusLower.includes('pending') || statusLower.includes('pendiente')) return 'warn';
    if (statusLower.includes('suspended') || statusLower.includes('suspendid')) return 'danger';
    if (statusLower.includes('cancelled') || statusLower.includes('cancelad')) return 'secondary';
    return 'info';
  }
}
