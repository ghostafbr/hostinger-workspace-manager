import { Component, ChangeDetectionStrategy, input } from '@angular/core';

@Component({
  selector: 'app-detail-item',

  template: `
    <div class="detail-item">
      <label class="detail-label">{{ label() }}</label>
      <div class="detail-value">
        @if (value()) {
          {{ value() }}
        } @else {
          <ng-content></ng-content>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .detail-item {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }

      .detail-label {
        font-size: 0.875rem;
        color: var(--text-color-secondary);
        font-weight: 500;
      }

      .detail-value {
        font-size: 1rem;
        color: var(--text-color);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailItemComponent {
  label = input.required<string>();
  value = input<string>();
}
