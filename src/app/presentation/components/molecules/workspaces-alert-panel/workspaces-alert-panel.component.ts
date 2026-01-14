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
    <p-card class="alert-panel">
      <ng-template pTemplate="header">
        <div class="card-header-custom">
          <i class="pi pi-exclamation-triangle card-icon"></i>
          <h3>Workspaces con Problemas</h3>
        </div>
      </ng-template>

      @if (workspaces().length === 0) {
        <div class="no-issues">
          <i class="pi pi-check-circle" style="font-size: 3rem; color: var(--green-500)"></i>
          <p>¡Todos los workspaces están activos!</p>
        </div>
      } @else {
        <div class="workspaces-list">
          @for (workspace of workspaces(); track workspace.id) {
            <div class="workspace-item">
              <div class="workspace-info">
                <div class="workspace-name">{{ workspace.name }}</div>
                <div class="workspace-description">
                  {{ workspace.description || 'Sin descripción' }}
                </div>
              </div>
              <div class="workspace-actions">
                <p-tag
                  [value]="getStatusLabel(workspace.status)"
                  [severity]="getStatusSeverity(workspace.status)"
                />
                <p-button
                  icon="pi pi-arrow-right"
                  [text]="true"
                  [rounded]="true"
                  (onClick)="navigateToWorkspace(workspace.id)"
                  pTooltip="Ver detalles"
                />
              </div>
            </div>
          }
        </div>
      }
    </p-card>
  `,
  styles: [
    `
      .alert-panel {
        height: 100%;
      }

      .card-header-custom {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 1.25rem;
        background: var(--orange-50);
      }

      .card-icon {
        font-size: 2rem;
        color: var(--orange-500);
      }

      .card-header-custom h3 {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--text-color);
      }

      .no-issues {
        text-align: center;
        padding: 2rem;
        color: var(--text-color-secondary);
      }

      .no-issues p {
        margin-top: 1rem;
        font-size: 1.1rem;
      }

      .workspaces-list {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .workspace-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
        border: 1px solid var(--surface-200);
        border-radius: var(--border-radius);
        background: var(--surface-card);
        transition: all 0.2s ease;
      }

      .workspace-item:hover {
        background: var(--surface-100);
        border-color: var(--primary-color);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .workspace-info {
        flex: 1;
      }

      .workspace-name {
        font-weight: 600;
        font-size: 1.05rem;
        color: var(--text-color);
        margin-bottom: 0.25rem;
      }

      .workspace-description {
        font-size: 0.9rem;
        color: var(--text-color-secondary);
      }

      .workspace-actions {
        display: flex;
        align-items: center;
        gap: 0.75rem;
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
    this.router.navigate(['/workspaces', id]);
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
