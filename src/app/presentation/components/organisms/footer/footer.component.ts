import { Component, ChangeDetectionStrategy, computed, inject, OnInit } from '@angular/core';
import { TagModule } from 'primeng/tag';
import { environment } from '../../../../../environments/environment';
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

  // Simplified health status (just needs to know severity for the dot)
  readonly healthStatus = computed<HealthStatus>(() => {
    const workspaces = this.workspaceService.workspaces();

    if (workspaces.length === 0) {
      return { label: 'Sin datos', severity: 'info' };
    }

    const hasErrors = workspaces.some(
      (ws) => ws.status === 'ERROR' || ws.status === 'INVALID_TOKEN',
    );
    const hasWarnings = workspaces.some(
      (ws) => ws.status === 'RATE_LIMITED' || ws.status === 'DISABLED',
    );

    if (hasErrors) return { label: 'Error', severity: 'danger' };
    if (hasWarnings) return { label: 'Alerta', severity: 'warn' };
    return { label: 'OK', severity: 'success' };
  });
}
