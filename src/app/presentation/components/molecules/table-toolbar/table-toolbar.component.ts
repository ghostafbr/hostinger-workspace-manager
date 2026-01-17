import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { ChipModule } from 'primeng/chip';

@Component({
  selector: 'app-table-toolbar',
  standalone: true,
  imports: [ChipModule],
  template: `
    <div class="table-header">
      <div class="header-left">
        <h2>
          @if (icon()) {
            <i [class]="icon()"></i>
          }
          {{ title() }}
        </h2>
        @if (count() !== undefined) {
          <p-chip [label]="count()!.toString()" class="ml-2" />
        }
      </div>
      <div class="header-right">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [
    `
      .table-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
        background: var(--surface-100);
        border-radius: 8px;
        margin-bottom: 1rem;
        flex-wrap: wrap;
        gap: 1rem;
      }

      .header-left {
        display: flex;
        align-items: center;
        gap: 0.5rem;

        h2 {
          margin: 0;
          font-size: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-color);

          i {
            color: var(--primary-color);
          }
        }
      }

      .header-right {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        flex-wrap: wrap;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableToolbarComponent {
  title = input.required<string>();
  icon = input<string>();
  count = input<number>();
}
