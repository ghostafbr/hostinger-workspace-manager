import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  imports: [
    CommonModule,
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

  ngOnInit(): void {
    this.loadWorkspaces();
  }

  async loadWorkspaces(): Promise<void> {
    try {
      await this.workspaceService.getAllWorkspaces();
    } catch (error) {
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
      message: `¿Estás seguro de desactivar el workspace "${workspace.name}"?`,
      header: 'Confirmar Desactivación',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        try {
          await this.workspaceService.disableWorkspace(workspace.id);
          this.messageService.add({
            severity: 'success',
            summary: 'Workspace Desactivado',
            detail: `El workspace "${workspace.name}" ha sido desactivado`,
          });
        } catch (error) {
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
        } catch (error) {
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
  formatDate(timestamp: { seconds: number; nanoseconds: number } | Date): string {
    if ('seconds' in timestamp) {
      return new Date(timestamp.seconds * 1000).toLocaleDateString('es-ES');
    }
    return timestamp.toLocaleDateString('es-ES');
  }
}
