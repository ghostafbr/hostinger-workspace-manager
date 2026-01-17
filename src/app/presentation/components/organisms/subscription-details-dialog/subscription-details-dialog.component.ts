import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';

// PrimeNG
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';

// Domain
import { Subscription as ISubscription } from '@app/domain/interfaces/subscription.interface';

// Components
import { ExpirationSemaphoreComponent } from '../../molecules/expiration-semaphore/expiration-semaphore.component';
import { ModalWrapperComponent } from '../../molecules/modal-wrapper/modal-wrapper.component';
import { DetailItemComponent } from '../../molecules/detail-item/detail-item.component';
import { RawDataViewerComponent } from '../../molecules/raw-data-viewer/raw-data-viewer.component';
import { StatusTagComponent } from '../../atoms/status-tag/status-tag.component';

/**
 * Subscription Details Dialog Component
 *
 * Shows complete subscription information with expandable raw data section
 */
@Component({
  selector: 'app-subscription-details-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    TagModule,
    DividerModule,
    ExpirationSemaphoreComponent,
    ModalWrapperComponent,
    DetailItemComponent,
    RawDataViewerComponent,
    StatusTagComponent,
  ],
  templateUrl: './subscription-details-dialog.component.html',
  styleUrl: './subscription-details-dialog.component.scss',
})
export class SubscriptionDetailsDialogComponent {
  readonly subscription = input.required<ISubscription | null>();
  readonly visible = input.required<boolean>();

  readonly visibleChange = output<boolean>();

  /**
   * Handle dialog close
   */
  onClose(): void {
    this.visibleChange.emit(false);
  }

  /**
   * Get tag severity for boolean values
   */
  getTagSeverity(value: boolean): 'success' | 'danger' {
    return value ? 'success' : 'danger';
  }
}
