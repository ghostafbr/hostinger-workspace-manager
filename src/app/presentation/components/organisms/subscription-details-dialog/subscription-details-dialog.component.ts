import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { DatePipe, JsonPipe } from '@angular/common';

// PrimeNG
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { Accordion, AccordionContent, AccordionHeader, AccordionPanel } from 'primeng/accordion';

// Domain
import { Subscription as ISubscription } from '@app/domain/interfaces/subscription.interface';

// Components
import { ExpirationSemaphoreComponent } from '../../molecules/expiration-semaphore/expiration-semaphore.component';

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
    JsonPipe,
    DialogModule,
    ButtonModule,
    TagModule,
    DividerModule,
    Accordion,
    AccordionPanel,
    AccordionHeader,
    AccordionContent,
    ExpirationSemaphoreComponent,
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

  /**
   * Get tag severity for boolean values
   */
  getTagSeverity(value: boolean): 'success' | 'danger' {
    return value ? 'success' : 'danger';
  }
}
