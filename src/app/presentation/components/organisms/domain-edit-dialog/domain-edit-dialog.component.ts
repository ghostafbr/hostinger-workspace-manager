import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  inject,
  signal,
  effect,
  LOCALE_ID,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CurrencyPipe, registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';

// PrimeNG
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';

// Domain
import { IDomain } from '@app/domain';

// Services
import { DomainService } from '@app/application';

// Register Spanish locale
registerLocaleData(localeEs);

/**
 * Domain Edit Dialog Component
 *
 * Dialog for editing domain contact email and pricing information
 */
@Component({
  selector: 'app-domain-edit-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CurrencyPipe,
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
  ],
  providers: [{ provide: LOCALE_ID, useValue: 'es' }],
  templateUrl: './domain-edit-dialog.component.html',
  styleUrl: './domain-edit-dialog.component.scss',
})
export class DomainEditDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly domainService = inject(DomainService);

  readonly domain = input.required<IDomain | null>();
  readonly visible = input.required<boolean>();

  readonly visibleChange = output<boolean>();
  readonly domainUpdated = output<void>();

  readonly isSaving = signal<boolean>(false);
  readonly totalPrice = signal<number>(0);

  readonly editForm: FormGroup = this.fb.group({
    contactEmail: ['', [Validators.email]],
    hostingRenewalPrice: [0, [Validators.min(0)]],
    domainRenewalPrice: [0, [Validators.min(0)]],
  });

  constructor() {
    // Update form when domain changes
    effect(() => {
      const domain = this.domain();
      if (domain) {
        let hostingPrice = domain.hostingRenewalPrice || 0;
        let domainPrice = domain.domainRenewalPrice || 0;

        // Legacy data migration: If no split prices exist but renewalPrice does, use it as domainPrice
        if (hostingPrice === 0 && domainPrice === 0 && domain.renewalPrice) {
          domainPrice = domain.renewalPrice;
        }

        this.editForm.patchValue({
          contactEmail: domain.contactEmail || '',
          hostingRenewalPrice: hostingPrice,
          domainRenewalPrice: domainPrice,
        });
        this.updateTotalPrice();
      }
    });

    // Update total price when form values change
    this.editForm.valueChanges.subscribe(() => {
      this.updateTotalPrice();
    });
  }

  /**
   * Update total price calculation
   */
  private updateTotalPrice(): void {
    const hosting = this.editForm.value.hostingRenewalPrice || 0;
    const domain = this.editForm.value.domainRenewalPrice || 0;
    this.totalPrice.set(hosting + domain);
  }

  /**
   * Save domain changes
   */
  async onSave(): Promise<void> {
    const domain = this.domain();
    if (!domain || this.editForm.invalid) {
      return;
    }

    this.isSaving.set(true);

    try {
      const updates = {
        contactEmail: this.editForm.value.contactEmail || undefined,
        hostingRenewalPrice: this.editForm.value.hostingRenewalPrice || 0,
        domainRenewalPrice: this.editForm.value.domainRenewalPrice || 0,
        renewalPrice: 0, // Explicitly clear legacy field to prefer split prices
      };

      await this.domainService.updateDomain(domain.id, updates);

      this.domainUpdated.emit();
      this.onClose();
    } catch (error) {
      console.error('Error updating domain:', error);
    } finally {
      this.isSaving.set(false);
    }
  }

  /**
   * Close dialog
   */
  onClose(): void {
    this.editForm.reset();
    this.visibleChange.emit(false);
  }
}
