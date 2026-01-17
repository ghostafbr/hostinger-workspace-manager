import { Component, ChangeDetectionStrategy, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { WorkspaceStatus } from '@app/domain';

export interface WorkspaceOption {
  label: string;
  value: string;
  status: string;
}

@Component({
  selector: 'app-workspace-selector',

  imports: [FormsModule, SelectModule, TagModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="workspace-selector" role="region" aria-label="Selector de workspace">
      <p-select
        [options]="options()"
        [(ngModel)]="value"
        placeholder="Selecciona un workspace"
        [showClear]="false"
        class="workspace-dropdown"
        aria-label="Seleccionar workspace activo"
      >
        <ng-template let-workspace pTemplate="selectedItem">
          @if (workspace) {
            <div class="workspace-item">
              <span class="workspace-name">{{ workspace.label }}</span>
              @if (workspace.status) {
                <p-tag
                  [value]="workspace.status"
                  [severity]="getStatusSeverity(workspace.status)"
                  class="workspace-status-tag"
                ></p-tag>
              }
            </div>
          }
        </ng-template>
        <ng-template let-workspace pTemplate="item">
          <div class="workspace-item">
            <span class="workspace-name">{{ workspace.label }}</span>
            <p-tag
              [value]="workspace.status"
              [severity]="getStatusSeverity(workspace.status)"
            ></p-tag>
          </div>
        </ng-template>
      </p-select>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .workspace-selector {
        min-width: 250px;
      }
      .workspace-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }
      .workspace-name {
        font-weight: 500;
        color: #334155;
      }
      :host ::ng-deep .workspace-status-tag .p-tag {
        padding: 0.1rem 0.4rem;
        font-size: 0.7rem;
      }
    `,
  ],
})
export class WorkspaceSelectorComponent {
  options = input.required<WorkspaceOption[]>();
  value = model<string | null>(null);

  getStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' {
    switch (status) {
      case WorkspaceStatus.ACTIVE:
        return 'success';
      case WorkspaceStatus.INVALID_TOKEN:
        return 'warn';
      case WorkspaceStatus.RATE_LIMITED:
        return 'warn';
      case WorkspaceStatus.ERROR: // Assuming ERROR is mapped to danger
      case WorkspaceStatus.DISABLED:
        return 'danger';
      default:
        return 'info';
    }
  }
}
