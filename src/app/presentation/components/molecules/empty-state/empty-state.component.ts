import { Component, ChangeDetectionStrategy, input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  template: `
    <div class="empty-state">
      <i [class]="icon()" class="empty-icon"></i>
      <p class="empty-text">{{ title() }}</p>
      @if (description()) {
        <p class="empty-hint">{{ description() }}</p>
      }
      <ng-content></ng-content>
    </div>
  `,
  styles: [
    `
      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 3rem;
        text-align: center;
        color: var(--text-color-secondary);
      }

      .empty-icon {
        font-size: 3rem;
        margin-bottom: 1rem;
        opacity: 0.5;
      }

      .empty-text {
        font-size: 1.25rem;
        font-weight: 600;
        margin: 0 0 0.5rem 0;
      }

      .empty-hint {
        margin: 0;
        font-size: 0.875rem;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyStateComponent {
  title = input.required<string>();
  description = input<string>();
  icon = input<string>('pi pi-inbox');
}
