import { ChangeDetectionStrategy, Component, OnInit, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';

// PrimeNG Imports
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ToolbarModule } from 'primeng/toolbar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TooltipModule } from 'primeng/tooltip';

// Services
import { WorkspaceService } from '@app/application/services/workspace.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Workspace, WorkspaceStatus } from '@app/domain';

/**
 * Workspaces List Page
 *
 * Displays all workspaces with CRUD operations
 */
@Component({
  selector: 'app-workspaces',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TableModule,
    ButtonModule,
    CardModule,
    TagModule,
    ToolbarModule,
    ConfirmDialogModule,
    ToastModule,
    InputTextModule,
    DialogModule,
    IconFieldModule,
    InputIconModule,
    TooltipModule,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './workspaces.page.html',
  styleUrl: './workspaces.page.scss',
})
export default class WorkspacesPage implements OnInit {
  private readonly workspaceService = inject(WorkspaceService);
  private readonly router = inject(Router);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  readonly workspaces = this.workspaceService.workspaces;
  readonly isLoading = this.workspaceService.isLoading;
  readonly searchTerm = signal<string>('');
  readonly isTestingConnection = signal<string | null>(null);
  readonly isSyncing = signal<string | null>(null);

  ngOnInit(): void {
    this.loadWorkspaces();
  }

  async loadWorkspaces(): Promise<void> {
    try {
      await this.workspaceService.getAllWorkspaces();
    } catch {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudieron cargar los workspaces',
      });
    }
  }

  /**
   * Get filtered workspaces based on search term
   */
  filteredWorkspaces = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) {
      return this.workspaces();
    }

    return this.workspaces().filter(
      (ws) =>
        ws.name.toLowerCase().includes(term) ||
        ws.description?.toLowerCase().includes(term),
    );
  });

  /**
   * Navigate to create workspace
   */
  createWorkspace(): void {
    this.router.navigate(['/workspaces/create']);
  }

  /**
   * Navigate to edit workspace
   */
  editWorkspace(workspace: Workspace): void {
    this.router.navigate(['/workspaces/edit', workspace.id]);
  }

  /**
   * Disable workspace with confirmation
   */
  disableWorkspace(workspace: Workspace): void {
    this.confirmationService.confirm({
      message: `¿Desactivar el workspace "${workspace.name}"? Se mantendrán todos los datos pero dejará de sincronizarse.`,
      header: 'Confirmar Desactivación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Desactivar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-warning',
      accept: async () => {
        try {
          await this.workspaceService.updateWorkspace(workspace.id, {
            status: WorkspaceStatus.DISABLED,
          });
          this.messageService.add({
            severity: 'success',
            summary: 'Workspace Desactivado',
            detail: `El workspace "${workspace.name}" ha sido desactivado`,
          });
          await this.loadWorkspaces();
        } catch {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo desactivar el workspace',
          });
        }
      },
    });
  }

  /**
   * Test connection to Hostinger API
   */
  async testConnection(workspace: Workspace): Promise<void> {
    try {
      this.isTestingConnection.set(workspace.id);
      await this.workspaceService.testConnection(workspace.id);
      this.messageService.add({
        severity: 'success',
        summary: 'Conexión Exitosa',
        detail: `El token de "${workspace.name}" es válido`,
      });
      await this.loadWorkspaces();
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error de Conexión',
        detail: error instanceof Error ? error.message : 'No se pudo conectar a Hostinger',
      });
    } finally {
      this.isTestingConnection.set(null);
    }
  }

  /**
   * Synchronize workspace now
   */
  async syncNow(workspace: Workspace): Promise<void> {
    try {
      this.isSyncing.set(workspace.id);
      await this.workspaceService.syncNow(workspace.id);
      this.messageService.add({
        severity: 'success',
        summary: 'Sincronización Completada',
        detail: `El workspace "${workspace.name}" se ha sincronizado correctamente`,
      });
      await this.loadWorkspaces();
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error de Sincronización',
        detail: error instanceof Error ? error.message : 'No se pudo sincronizar',
      });
    } finally {
      this.isSyncing.set(null);
    }
  }

  /**
   * Get tooltip text for status
   */
  getStatusTooltip(status: WorkspaceStatus, lastError?: string): string {
    switch (status) {
      case WorkspaceStatus.ACTIVE:
        return 'Workspace activo y funcionando correctamente';
      case WorkspaceStatus.INVALID_TOKEN:
        return lastError || 'El token de Hostinger es inválido o ha expirado. Por favor, actualícelo.';
      case WorkspaceStatus.RATE_LIMITED:
        return 'Se ha excedido el límite de solicitudes a la API. Intente más tarde.';
      case WorkspaceStatus.ERROR:
        return lastError || 'Error al conectar con Hostinger. Verifique la configuración.';
      case WorkspaceStatus.DISABLED:
        return 'Workspace desactivado. No se sincronizará automáticamente.';
      default:
        return status;
    }
  }

  /**
   * Delete workspace with confirmation
   */
  deleteWorkspace(workspace: Workspace): void {
    this.confirmationService.confirm({
      message: `¿Estás seguro de eliminar el workspace "${workspace.name}"? Esta acción no se puede deshacer.`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-trash',
      acceptButtonStyleClass: 'p-button-danger',
      accept: async () => {
        try {
          await this.workspaceService.deleteWorkspace(workspace.id);
          this.messageService.add({
            severity: 'success',
            summary: 'Workspace Eliminado',
            detail: `El workspace "${workspace.name}" ha sido eliminado`,
          });
        } catch {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo eliminar el workspace',
          });
        }
      },
    });
  }

  /**
   * Get severity for status tag
   */
  getStatusSeverity(
    status: WorkspaceStatus,
  ): 'success' | 'warn' | 'danger' | 'info' {
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

  /**
   * Get label for status
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
   * Format date
   */
  formatDate(timestamp: { seconds: number; nanoseconds: number } | Date | undefined): string {
    if (!timestamp) {
      return 'Nunca';
    }
    if ('seconds' in timestamp) {
      return new Date(timestamp.seconds * 1000).toLocaleDateString('es-ES');
    }
    return timestamp.toLocaleDateString('es-ES');
  }
}
