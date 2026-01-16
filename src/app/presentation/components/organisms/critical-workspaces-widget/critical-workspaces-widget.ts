import { Component, computed, input, output, ChangeDetectionStrategy, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ChipModule } from 'primeng/chip';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import type { IWorkspace } from '@app/domain';
import { WorkspaceStatus } from '@app/domain';

interface CriticalWorkspace {
  workspace: IWorkspace;
  criticalityScore: number;
  reasons: string[];
}

/**
 * Critical Workspaces Widget Component
 *
 * Shows most critical workspaces based on urgency score
 */
@Component({
  selector: 'app-critical-workspaces-widget',
  standalone: true,
  imports: [CommonModule, CardModule, ChipModule, ButtonModule, TooltipModule],
  template: `
    <div class="glass-card full-height critical-widget-container">
      <div class="card-header-compact">
        <div class="header-icon-wrapper">
          <i class="pi pi-exclamation-triangle"></i>
        </div>
        <h3>Workspaces Críticos</h3>
      </div>

      <div class="critical-list-container">
        @if (criticalWorkspaces().length === 0) {
          <div class="no-data">
            <div class="success-icon-wrapper">
              <i class="pi pi-verified"></i>
            </div>
            <p>Todo en orden</p>
            <span class="sub-text">No hay workspaces críticos</span>
          </div>
        } @else {
          <div class="list-content">
            @for (item of criticalWorkspaces(); track item.workspace.id) {
              <div
                class="critical-item"
                [class]="getSeverityClass(item.criticalityScore)"
                (click)="onWorkspaceClick(item.workspace)"
              >
                <div class="item-content">
                  <div class="item-main">
                    <div class="name-row">
                      <h4 class="workspace-name">{{ item.workspace.name }}</h4>
                      <span class="score-pill" [class]="getSeverityClass(item.criticalityScore)">{{
                        item.criticalityScore
                      }}</span>
                    </div>
                    <div class="status-row">
                      <span
                        class="status-dot"
                        [class]="getStatusClass(item.workspace.status)"
                      ></span>
                      <span class="status-text">{{ item.workspace.status }}</span>
                    </div>
                  </div>
                  <div class="item-action">
                    <i class="pi pi-chevron-right"></i>
                  </div>
                </div>

                <div class="reasons-list">
                  @for (reason of item.reasons.slice(0, 1); track $index) {
                    <div class="reason-pill">
                      <i class="pi pi-info-circle"></i>
                      <span>{{ reason }}</span>
                    </div>
                  }
                  @if (item.reasons.length > 1) {
                    <span class="more-reasons">+{{ item.reasons.length - 1 }} más</span>
                  }
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .critical-widget-container {
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

      .card-header-compact .header-icon-wrapper {
        width: 2.5rem;
        height: 2.5rem;
        border-radius: 12px;
        background: rgba(239, 68, 68, 0.1);
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .card-header-compact .header-icon-wrapper i {
        color: var(--red-500);
        font-size: 1.25rem;
      }

      .card-header-compact h3 {
        margin: 0;
        font-size: 1.1rem;
        font-weight: 600;
        color: var(--text-color);
      }

      .critical-list-container {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow-y: auto;
        padding-right: 0.5rem;
      }

      .no-data {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 2rem;
        text-align: center;
      }

      .no-data .success-icon-wrapper {
        width: 4rem;
        height: 4rem;
        background: rgba(16, 185, 129, 0.1);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 1rem;
      }

      .no-data .success-icon-wrapper i {
        font-size: 2rem;
        color: var(--green-600);
      }

      .no-data p {
        margin: 0 0 0.5rem 0;
        font-size: 1.1rem;
        font-weight: 600;
        color: var(--text-color);
      }

      .no-data .sub-text {
        color: var(--text-color-secondary);
        font-size: 0.9rem;
      }

      .list-content {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .critical-item {
        background: var(--surface-50);
        border-radius: 12px;
        padding: 1rem;
        border: 1px solid transparent;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .critical-item:hover {
        background: white;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        transform: translateY(-2px);
      }

      .critical-item:hover .item-action i {
        transform: translateX(2px);
        color: var(--primary-color);
      }

      .critical-item.critical {
        border-left: 3px solid var(--red-500);
      }

      .critical-item.high {
        border-left: 3px solid var(--orange-500);
      }

      .critical-item.medium {
        border-left: 3px solid var(--yellow-500);
      }

      .item-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.75rem;
      }

      .item-main {
        flex: 1;
      }

      .name-row {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 0.25rem;
      }

      .name-row .workspace-name {
        margin: 0;
        font-size: 1rem;
        font-weight: 600;
        color: var(--text-color);
      }

      .name-row .score-pill {
        font-size: 0.75rem;
        font-weight: 700;
        padding: 0.1rem 0.5rem;
        border-radius: 12px;
        background: var(--surface-200);
        color: var(--text-color-secondary);
      }

      .name-row .score-pill.critical {
        background: #fef2f2;
        color: #dc2626;
      }

      .name-row .score-pill.high {
        background: #fffbeb;
        color: #d97706;
      }

      .name-row .score-pill.medium {
        background: #fef9c3;
        color: #ca8a04;
      }

      .name-row .score-pill.low {
        background: #f3f4f6;
        color: #4b5563;
      }

      .status-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .status-row .status-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: var(--surface-400);
      }

      .status-row .status-dot.status-active {
        background: #10b981;
      }

      .status-row .status-dot.status-error {
        background: #ef4444;
      }

      .status-row .status-text {
        font-size: 0.85rem;
        color: var(--text-color-secondary);
      }

      .item-action {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 2rem;
        height: 2rem;
        border-radius: 50%;
        color: var(--text-color-secondary);
        transition: all 0.2s ease;
      }

      .reasons-list {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        flex-wrap: wrap;
      }

      .reasons-list .reason-pill {
        display: flex;
        align-items: center;
        gap: 0.35rem;
        padding: 0.25rem 0.6rem;
        background: rgba(0, 0, 0, 0.04);
        border-radius: 6px;
        font-size: 0.8rem;
        color: var(--text-color-secondary);
      }

      .reasons-list .reason-pill i {
        font-size: 0.75rem;
        opacity: 0.7;
      }

      .reasons-list .more-reasons {
        font-size: 0.75rem;
        color: var(--text-color-secondary);
        font-weight: 500;
        padding-left: 0.25rem;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CriticalWorkspacesWidgetComponent {
  workspaces = input.required<IWorkspace[]>();
  maxItems = input<number>(5);

  workspaceClicked = output<IWorkspace>();

  /**
   * Calculate criticality scores and sort
   */
  criticalWorkspaces: Signal<CriticalWorkspace[]> = computed(() => {
    const all = this.workspaces();
    const max = this.maxItems();

    return all
      .map((workspace) => this.calculateCriticality(workspace))
      .sort((a, b) => b.criticalityScore - a.criticalityScore)
      .slice(0, max);
  });

  /**
   * Calculate criticality score for a workspace
   */
  private calculateCriticality(workspace: IWorkspace): CriticalWorkspace {
    let score = 0;
    const reasons: string[] = [];

    // Status errors (+50 points)
    if (workspace.status !== WorkspaceStatus.ACTIVE) {
      score += 50;
      reasons.push(`Estado: ${workspace.status}`);
    }

    // Priority level (1-5, +10-50 points)
    if (workspace.priority) {
      score += workspace.priority * 10;
      if (workspace.priority >= 4) {
        reasons.push(`Prioridad alta (${workspace.priority}/5)`);
      }
    }

    // Recent sync failures (+30 points)
    const now = new Date();
    if (workspace.lastSyncAt) {
      const lastSync =
        workspace.lastSyncAt instanceof Date ? workspace.lastSyncAt : workspace.lastSyncAt.toDate();
      const daysSinceSync = (now.getTime() - lastSync.getTime()) / (24 * 60 * 60 * 1000);

      if (daysSinceSync > 7) {
        score += 30;
        reasons.push(`Sin sincronizar hace ${Math.floor(daysSinceSync)} días`);
      }
    }

    // Last error (+40 points)
    if (workspace.lastError) {
      score += 40;
      reasons.push('Error detectado en última sincronización');
    }

    return {
      workspace,
      criticalityScore: score,
      reasons: reasons.length > 0 ? reasons : ['Sin problemas detectados'],
    };
  }

  /**
   * Get severity class for criticality score
   */
  getSeverityClass(score: number): string {
    if (score >= 100) return 'critical';
    if (score >= 50) return 'high';
    if (score >= 20) return 'medium';
    return 'low';
  }

  /**
   * Get status badge class
   */
  getStatusClass(status: WorkspaceStatus): string {
    return status === WorkspaceStatus.ACTIVE ? 'status-active' : 'status-error';
  }

  /**
   * Handle workspace click
   */
  onWorkspaceClick(workspace: IWorkspace): void {
    this.workspaceClicked.emit(workspace);
  }
}
