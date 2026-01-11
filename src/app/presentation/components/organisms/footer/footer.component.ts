import { Component, ChangeDetectionStrategy, computed, inject, OnInit } from '@angular/core';
import { TagModule } from 'primeng/tag';
import { environment } from 'environments/environment';
import { WorkspaceService } from '@app/application/services/workspace.service';
import { AuthService } from '@app/application/services/auth.service';

interface HealthStatus {
  label: string;
  severity: 'success' | 'info' | 'warn' | 'danger';
}

/**
 * Footer Component
 *
 * Application footer with version, last sync, and health status
 */
@Component({
  selector: 'app-footer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TagModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent implements OnInit {
  private readonly workspaceService = inject(WorkspaceService);
  private readonly authService = inject(AuthService);

  readonly currentYear = new Date().getFullYear();
  readonly appVersion = environment.version || '1.0.0';

  async ngOnInit(): Promise<void> {
    // Esperar a que Firebase Auth determine el estado de autenticación
    await this.authService.waitForAuthInit();

    // Solo cargar workspaces si el usuario está autenticado y no hay workspaces cargados
    if (this.authService.isAuthenticated() && this.workspaceService.workspaces().length === 0) {
      await this.loadWorkspaces();
    }
  }

  private async loadWorkspaces(): Promise<void> {
    try {
      await this.workspaceService.getAllWorkspaces();
    } catch (error) {
      console.error('Error loading workspaces in footer:', error);
    }
  }

  // Last global sync computed from workspaces
  readonly lastGlobalSync = computed<string>(() => {
    const lastSync = this.workspaceService.getLastGlobalSync();
    if (!lastSync) return 'Nunca';

    const now = Date.now();
    const diffMs = now - lastSync.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) return 'Hace un momento';
    if (diffMinutes < 60) return `Hace ${diffMinutes} min`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} d\u00edas`;

    return lastSync.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  });

  // Health status based on workspace states
  readonly healthStatus = computed<HealthStatus>(() => {
    const workspaces = this.workspaceService.workspaces();

    if (workspaces.length === 0) {
      return {
        label: 'Sin datos',
        severity: 'info',
      };
    }

    const hasErrors = workspaces.some(
      (ws) => ws.status === 'ERROR' || ws.status === 'INVALID_TOKEN',
    );

    const hasWarnings = workspaces.some(
      (ws) => ws.status === 'RATE_LIMITED' || ws.status === 'DISABLED',
    );

    if (hasErrors) {
      return {
        label: 'Con errores',
        severity: 'danger',
      };
    }

    if (hasWarnings) {
      return {
        label: 'Con avisos',
        severity: 'warn',
      };
    }

    return {
      label: 'Operativo',
      severity: 'success',
    };
  });
}
