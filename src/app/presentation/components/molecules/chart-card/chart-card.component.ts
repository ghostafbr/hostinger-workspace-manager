import { Component, ChangeDetectionStrategy, input } from '@angular/core';

@Component({
  selector: 'app-chart-card',

  template: `
    <div class="glass-chart-card">
      <div class="chart-header">
        <div class="header-title">
          <div class="icon-indicator">
            <i [class]="icon()"></i>
          </div>
          <h3>{{ title() }}</h3>
        </div>
        <div class="header-actions">
          <ng-content select="[slot=actions]"></ng-content>
        </div>
      </div>
      <div class="chart-content">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .glass-chart-card {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 1.5rem;
        box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
        transition: box-shadow 0.2s;
      }
      .glass-chart-card:hover {
        box-shadow:
          0 4px 6px -1px rgba(0, 0, 0, 0.1),
          0 2px 4px -1px rgba(0, 0, 0, 0.06);
      }
      .chart-header {
        margin-bottom: 2rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .chart-header .header-title {
        display: flex;
        align-items: center;
        gap: 1rem;
      }
      .chart-header .header-title .icon-indicator {
        width: 40px;
        height: 40px;
        border-radius: 10px;
        background: var(--surface-50);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--primary-color);
        border: 1px solid #e2e8f0;
      }
      .chart-header .header-title .icon-indicator i {
        font-size: 1.2rem;
      }
      .chart-header .header-title h3 {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 600;
        color: #1e293b;
      }
      .chart-content {
        position: relative;
        width: 100%;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartCardComponent {
  title = input.required<string>();
  icon = input.required<string>();
}
