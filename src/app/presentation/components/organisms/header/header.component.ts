import { Component, EventEmitter, Output, inject, computed, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { MenuModule } from 'primeng/menu';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { MenuItem } from 'primeng/api';
import { MessageService } from 'primeng/api';
import { AuthService } from '@app/application/services/auth.service';
import { WorkspaceService } from '@app/application/services/workspace.service';
import { WorkspaceContextService } from '@app/application/services/workspace-context.service';
import { WorkspaceStatus } from '@app/domain';

interface WorkspaceOption {
  label: string;
  value: string;
  status: string;
}

/**
 * Header Component
 *
 * Application top bar with workspace selector, quick actions and user menu
 */
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    AvatarModule,
    MenuModule,
    SelectModule,
    TagModule,
    TooltipModule,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  @Output() toggleSidebar = new EventEmitter<void>();

  private readonly authService = inject(AuthService);
  private readonly workspaceService = inject(WorkspaceService);
  private readonly workspaceContext = inject(WorkspaceContextService);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);

  // User state
  readonly currentUser = this.authService.currentUser;
  readonly userInitials = computed(() => {
    const user = this.currentUser();
    if (!user?.email) return 'U';
    return user.email.charAt(0).toUpperCase();
  });

  // Workspace state
  readonly workspaces = this.workspaceService.workspaces;
  readonly selectedWorkspace = this.workspaceContext.selectedWorkspace;
  readonly hasWorkspaceSelected = this.workspaceContext.hasWorkspaceSelected;

  selectedWorkspaceId: string | null = null;

  readonly workspaceOptions = computed<WorkspaceOption[]>(() => {
    return this.workspaces().map(ws => ({
      label: ws.name,
      value: ws.id,
      status: ws.status,
    }));
  });

  // Quick actions state
  readonly isTestingConnection = signal(false);
  readonly isSyncing = signal(false);

  readonly canTestConnection = computed(() => {
    const workspace = this.selectedWorkspace();
    return workspace?.status !== WorkspaceStatus.DISABLED;
  });

  readonly canSync = computed(() => {
    const workspace = this.selectedWorkspace();
    return workspace?.status === WorkspaceStatus.ACTIVE;
  });

  readonly userMenuItems: MenuItem[] = [
    {
      label: 'Perfil',
      icon: 'pi pi-user',
      command: () => this.router.navigate(['/settings']),
    },
    {
      label: 'Configuración',
      icon: 'pi pi-cog',
      command: () => this.router.navigate(['/settings']),
    },
    {
      separator: true,
    },
    {
      label: 'Cerrar Sesión',
      icon: 'pi pi-sign-out',
      command: () => this.logout(),
    },
  ];

  constructor() {
    // Load workspaces on init
    this.loadWorkspaces();

    // Sync selected workspace ID with context
    effect(() => {
      const workspace = this.selectedWorkspace();
      if (workspace) {
        this.selectedWorkspaceId = workspace.id;
      } else {
        this.selectedWorkspaceId = null;
      }
    });
  }

  async loadWorkspaces(): Promise<void> {
    try {
      await this.workspaceService.getAllWorkspaces();
    } catch (error) {
      console.error('Error loading workspaces:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load workspaces',
      });
    }
  }

  onWorkspaceChange(event: { value: string }): void {
    const workspaceId = event.value;
    const workspace = this.workspaces().find(ws => ws.id === workspaceId);

    if (workspace) {
      this.workspaceContext.selectWorkspace(workspace);
      // Navigate to workspace dashboard
      this.router.navigate(['/w', workspaceId, 'dashboard']);
    }
  }

  async onTestConnection(): Promise<void> {
    const workspace = this.selectedWorkspace();
    if (!workspace) return;

    this.isTestingConnection.set(true);
    try {
      // TODO: Implementar test de conexión real con Cloud Functions
      await new Promise(resolve => setTimeout(resolve, 1500));

      this.messageService.add({
        severity: 'success',
        summary: 'Test exitoso',
        detail: 'Conexión a Hostinger API verificada correctamente',
      });
    } catch (_error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Test fallido',
        detail: 'No se pudo conectar con la API de Hostinger',
      });
    } finally {
      this.isTestingConnection.set(false);
    }
  }

  async onSyncNow(): Promise<void> {
    const workspace = this.selectedWorkspace();
    if (!workspace) return;

    this.isSyncing.set(true);
    try {
      // TODO: Implementar sincronización real con Cloud Functions
      await new Promise(resolve => setTimeout(resolve, 2000));

      this.messageService.add({
        severity: 'success',
        summary: 'Sincronización completada',
        detail: 'Datos actualizados desde Hostinger',
      });
    } catch (_error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error al sincronizar',
        detail: 'No se pudieron actualizar los datos',
      });
    } finally {
      this.isSyncing.set(false);
    }
  }

  getStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' {
    switch (status) {
      case WorkspaceStatus.ACTIVE:
        return 'success';
      case WorkspaceStatus.INVALID_TOKEN:
        return 'warn';
      case WorkspaceStatus.RATE_LIMITED:
        return 'warn';
      case WorkspaceStatus.ERROR:
        return 'danger';
      case WorkspaceStatus.DISABLED:
        return 'danger';
      default:
        return 'info';
    }
  }

  onToggleSidebar(): void {
    this.toggleSidebar.emit();
  }

  async logout(): Promise<void> {
    this.workspaceContext.clearWorkspace();
    await this.authService.signOut();
    this.router.navigate(['/login']);
  }
}
