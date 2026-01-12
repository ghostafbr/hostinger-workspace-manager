import {
  Component,
  computed,
  input,
  output,
  ChangeDetectionStrategy,
  Signal,
} from '@angular/core';
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
  templateUrl: './critical-workspaces-widget.html',
  styleUrl: './critical-workspaces-widget.scss',
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
        workspace.lastSyncAt instanceof Date
          ? workspace.lastSyncAt
          : workspace.lastSyncAt.toDate();
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
