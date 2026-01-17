import { Component, ChangeDetectionStrategy, input, output, signal } from '@angular/core';
import { DatePipe } from '@angular/common';

// PrimeNG
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';

// Domain
import { IDomain } from '@app/domain';

// Components
import { ExpirationSemaphoreComponent } from '../../molecules/expiration-semaphore/expiration-semaphore.component';
import { ModalWrapperComponent } from '../../molecules/modal-wrapper/modal-wrapper.component';
import { DetailItemComponent } from '../../molecules/detail-item/detail-item.component';
import { RawDataViewerComponent } from '../../molecules/raw-data-viewer/raw-data-viewer.component';

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
    TagModule,
    DividerModule,
    ExpirationSemaphoreComponent,
    ModalWrapperComponent,
    DetailItemComponent,
    RawDataViewerComponent,
  ],
  templateUrl: './domain-details-dialog.component.html',
  styleUrl: './domain-details-dialog.component.scss',
})
export class DomainDetailsDialogComponent {
  readonly domain = input.required<IDomain | null>();
  readonly visible = input.required<boolean>();

  readonly visibleChange = output<boolean>();

  /**
   * Close dialog
   */
  onClose(): void {
    this.visibleChange.emit(false);
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
