import { Injectable, computed, signal } from '@angular/core';
import { Workspace } from '../../domain/models/workspace.model';
import { WorkspaceStatus } from '../../domain/enums/workspace-status.enum';

/**
 * WorkspaceContextService
 *
 * Gestiona el contexto del workspace seleccionado actualmente.
 * Mantiene el estado global del workspace activo y proporciona
 * métodos para seleccionar, limpiar y consultar el workspace actual.
 */
@Injectable({
  providedIn: 'root'
})
export class WorkspaceContextService {
  // Estado privado del workspace seleccionado
  private readonly selectedWorkspaceSignal = signal<Workspace | null>(this.getInitialWorkspace());

  // Estado público de solo lectura
  readonly selectedWorkspace = this.selectedWorkspaceSignal.asReadonly();

  // Computados útiles
  readonly hasWorkspaceSelected = computed(() => this.selectedWorkspaceSignal() !== null);
  readonly workspaceId = computed(() => this.selectedWorkspaceSignal()?.id ?? null);
  readonly workspaceName = computed(() => this.selectedWorkspaceSignal()?.name ?? '');
  readonly workspaceStatus = computed(() => this.selectedWorkspaceSignal()?.status ?? null);
  readonly isWorkspaceActive = computed(() => {
    const status = this.workspaceStatus();
    return status === WorkspaceStatus.ACTIVE || status === WorkspaceStatus.INVALID_TOKEN;
  });

  /**
   * Selecciona un workspace y lo guarda en el contexto
   */
  selectWorkspace(workspace: Workspace): void {
    this.selectedWorkspaceSignal.set(workspace);
    this.saveToStorage(workspace);
  }

  /**
   * Limpia el workspace seleccionado
   */
  clearWorkspace(): void {
    this.selectedWorkspaceSignal.set(null);
    this.clearStorage();
  }

  /**
   * Obtiene el workspace actual (puede ser null)
   */
  getCurrentWorkspace(): Workspace | null {
    return this.selectedWorkspaceSignal();
  }

  /**
   * Verifica si hay un workspace seleccionado
   */
  hasWorkspace(): boolean {
    return this.hasWorkspaceSelected();
  }

  /**
   * Guarda el workspace en localStorage para persistencia
   */
  private saveToStorage(workspace: Workspace): void {
    try {
      localStorage.setItem('selected_workspace', JSON.stringify({
        id: workspace.id,
        name: workspace.name,
        status: workspace.status,
        // Solo guardamos campos esenciales
      }));
    } catch (error) {
      console.error('Error saving workspace to storage:', error);
    }
  }

  /**
   * Carga el workspace desde localStorage
   */
  private getInitialWorkspace(): Workspace | null {
    try {
      if (typeof localStorage === 'undefined') return null;
      const stored = localStorage.getItem('selected_workspace');
      if (stored) {
        const data = JSON.parse(stored);
        // Nota: En producción, deberías validar/recargar el workspace
        // desde Firestore para asegurar que sigue existiendo y tiene permisos
        return data as Workspace;
      }
      return null;
    } catch (error) {
      console.error('Error loading workspace from storage:', error);
      this.clearStorage();
      return null;
    }
  }

  /**
   * Limpia el localStorage
   */
  private clearStorage(): void {
    try {
      localStorage.removeItem('selected_workspace');
    } catch (error) {
      console.error('Error clearing workspace storage:', error);
    }
  }
}
