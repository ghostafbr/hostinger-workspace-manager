import { Component, ChangeDetectionStrategy, input, output, signal } from '@angular/core';
import { DatePipe, JsonPipe } from '@angular/common';

// PrimeNG
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { Accordion, AccordionContent, AccordionHeader, AccordionPanel } from 'primeng/accordion';

// Domain
import { IDomain } from '@app/domain';

// Components
import { ExpirationSemaphoreComponent } from '../../molecules/expiration-semaphore/expiration-semaphore.component';

/**
 * Domain Details Dialog Component
 *
 * Shows complete domain information with expandable raw data section
 */
@Component({
  selector: 'app-domain-details-dialog',

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
  templateUrl: './domain-details-dialog.component.html',
  styleUrl: './domain-details-dialog.component.scss',
})
export class DomainDetailsDialogComponent {
  readonly domain = input.required<IDomain | null>();
  readonly visible = input.required<boolean>();

  readonly visibleChange = output<boolean>();

  readonly showRawData = signal<boolean>(false);

  /**
   * Close dialog
   */
  onClose(): void {
    this.visibleChange.emit(false);
  }

  /**
   * Toggle raw data visibility
   */
  toggleRawData(): void {
    this.showRawData.update((v) => !v);
  }

  /**
   * Get privacy/lock tag severity
   */
  getTagSeverity(enabled: boolean): 'success' | 'secondary' {
    return enabled ? 'success' : 'secondary';
  }

  /**
   * Format nameservers list
   */
  formatNameservers(nameservers: string[] | undefined): string {
    if (!nameservers || nameservers.length === 0) return 'N/A';
    return nameservers.join('\n');
  }
}
