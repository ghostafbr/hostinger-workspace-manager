import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-modal-wrapper',

  imports: [DialogModule, ButtonModule],
  template: `
    <p-dialog
      [header]="header()"
      [visible]="visible()"
      (visibleChange)="onClose.emit()"
      [modal]="true"
      [style]="{ width: width(), maxWidth: '95vw' }"
      [breakpoints]="{ '960px': '95vw', '640px': '100vw' }"
      [dismissableMask]="true"
      [draggable]="false"
      [resizable]="false"
    >
      @if (visible()) {
        <!-- Optional Sub-Header or Content Projection for it -->
        <ng-content select="[slot=header]"></ng-content>

        <div class="dialog-content">
          <ng-content></ng-content>
        </div>

        <ng-template pTemplate="footer">
          <p-button
            label="Cerrar"
            icon="pi pi-times"
            (onClick)="onClose.emit()"
            severity="secondary"
          />
        </ng-template>
      }
    </p-dialog>
  `,
  styles: [
    `
      .dialog-content {
        /* Consistent padding/spacing can be added here if needed, 
         though PrimeNG dialogs handle most of it. */
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalWrapperComponent {
  visible = input.required<boolean>();
  header = input.required<string>();
  width = input<string>('700px');

  onClose = output<void>();
}
