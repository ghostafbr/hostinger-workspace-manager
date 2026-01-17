import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { AccordionModule } from 'primeng/accordion';

@Component({
  selector: 'app-raw-data-viewer',

  imports: [AccordionModule, JsonPipe],
  template: `
    <div class="raw-data-section">
      <p-accordion [value]="['0']">
        <p-accordionpanel value="0">
          <p-accordionheader>
            <div class="accordion-header">
              <i class="pi pi-code"></i>
              <span>{{ label() }}</span>
            </div>
          </p-accordionheader>
          <p-accordioncontent>
            <pre class="raw-data-content">{{ data() | json }}</pre>
          </p-accordioncontent>
        </p-accordionpanel>
      </p-accordion>
    </div>
  `,
  styles: [
    `
      .raw-data-content {
        background: var(--surface-50);
        padding: 1rem;
        border-radius: 6px;
        overflow-x: auto;
        font-size: 0.875rem;
        margin: 0;
        color: var(--text-color);
      }

      .accordion-header {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-weight: 500;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RawDataViewerComponent {
  data = input.required<any>();
  label = input<string>('Datos Raw (JSON)');
}
