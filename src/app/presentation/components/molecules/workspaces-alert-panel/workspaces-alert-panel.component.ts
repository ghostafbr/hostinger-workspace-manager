import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { Workspace, WorkspaceStatus } from '@app/domain';

/**
 * Workspaces Alert Panel Component (Molecule)
 *
 * Displays workspaces with errors/warnings for quick access
 */
@Component({
  selector: 'app-workspaces-alert-panel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CardModule, TagModule, ButtonModule],
  template: `
    <div class="glass-card alert-panel-container">
      <div class="card-header-compact">
        <div class="header-icon-wrapper">
          <i class="pi pi-exclamation-triangle"></i>
        </div>
        <h3>Workspaces Críticos</h3>
      </div>

      @if (workspaces().length === 0) {
        <div class="no-issues">
          <div class="success-icon-wrapper">
            <i class="pi pi-verified"></i>
          </div>
          <p>Todo en orden</p>
          <span class="sub-text">Todos los workspaces están activos</span>
        </div>
      } @else {
        <div class="workspaces-list">
          @for (workspace of workspaces(); track workspace.id) {
            <div class="workspace-item">
              <div class="workspace-info">
                <div class="name-row">
                  <span class="workspace-name">{{ workspace.name }}</span>
                  <p-tag
                    [value]="getStatusLabel(workspace.status)"
                    [severity]="getStatusSeverity(workspace.status)"
                    class="compact-tag"
                  />
                </div>
                <div class="workspace-description">
                  {{ workspace.description || 'Sin descripción' }}
                </div>
              </div>
              <p-button
                icon="pi pi-chevron-right"
                [text]="true"
                [rounded]="true"
                size="small"
                styleClass="action-btn"
                (onClick)="navigateToWorkspace(workspace.id)"
                pTooltip="Ver detalles"
              />
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [
    `
      .alert-panel-container {
        height: 100%;
        display: flex;
        flex-direction: column;
      }

      .card-header-compact {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 1.5rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid rgba(229, 231, 235, 0.6);
      }

      .header-icon-wrapper {
        width: 2.5rem;
        height: 2.5rem;
        border-radius: 12px;
        background: rgba(239, 68, 68, 0.1); // Red-500 optimized
        display: flex;
        align-items: center;
        justify-content: center;

        i {
          color: var(--red-500);
          font-size: 1.25rem;
        }
      }

      h3 {
        margin: 0;
        font-size: 1.1rem;
        font-weight: 600;
        color: var(--text-color);
      }

      .no-issues {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 2rem;
        text-align: center;

        .success-icon-wrapper {
          width: 4rem;
          height: 4rem;
          background: rgba(16, 185, 129, 0.1);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1rem;

          i {
            font-size: 2rem;
            color: var(--green-600);
          }
        }

        p {
          margin: 0 0 0.5rem 0;
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--text-color);
        }

        .sub-text {
          color: var(--text-color-secondary);
          font-size: 0.9rem;
        }
      }

      .workspaces-list {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .workspace-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.75rem 1rem;
        background: var(--surface-50);
        border: 1px solid transparent;
        border-radius: 12px;
        transition: all 0.2s ease;

        &:hover {
          background: white;
          border-color: rgba(229, 231, 235, 0.8);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
          transform: translateX(4px);
        }
      }

      .workspace-info {
        flex: 1;
        min-width: 0; // Truncate text
      }

      .name-row {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 0.25rem;
      }

      .workspace-name {
        font-weight: 600;
        font-size: 0.95rem;
        color: var(--text-color);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .workspace-description {
        font-size: 0.85rem;
        color: var(--text-color-secondary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      :host ::ng-deep .compact-tag .p-tag {
        padding: 0.1rem 0.5rem;
        font-size: 0.75rem;
        line-height: 1.2;
      }

      :host ::ng-deep .action-btn.p-button {
        color: var(--text-color-secondary);
        width: 2rem;
        height: 2rem;

        &:hover {
          background: rgba(0, 0, 0, 0.05);
          color: var(--primary-color);
        }
      }
    `,
  ],
})
export class WorkspacesAlertPanelComponent {
  readonly workspaces = input.required<Workspace[]>();

  constructor(private router: Router) {}

  /**
   * Navigate to workspace details
   */
  navigateToWorkspace(id: string): void {
    this.router.navigate(['/w', id, 'dashboard']);
  }

  /**
   * Get status label
   */
  getStatusLabel(status: WorkspaceStatus): string {
    switch (status) {
      case WorkspaceStatus.ACTIVE:
        return 'Activo';
      case WorkspaceStatus.INVALID_TOKEN:
        return 'Token Inválido';
      case WorkspaceStatus.RATE_LIMITED:
        return 'Límite Excedido';
      case WorkspaceStatus.ERROR:
        return 'Error';
      case WorkspaceStatus.DISABLED:
        return 'Desactivado';
      default:
        return status;
    }
  }

  /**
   * Get status severity for PrimeNG tag
   */
  getStatusSeverity(status: WorkspaceStatus): 'success' | 'danger' | 'warn' | 'info' {
    switch (status) {
      case WorkspaceStatus.ACTIVE:
        return 'success';
      case WorkspaceStatus.INVALID_TOKEN:
      case WorkspaceStatus.ERROR:
        return 'danger';
      case WorkspaceStatus.RATE_LIMITED:
        return 'warn';
      case WorkspaceStatus.DISABLED:
        return 'info';
      default:
        return 'info';
    }
  }
}
