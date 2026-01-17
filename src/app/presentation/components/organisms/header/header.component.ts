import {
  Component,
  ChangeDetectionStrategy,
  output,
  inject,
  computed,
  signal,
  effect,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { MenuItem } from 'primeng/api';
import { MessageService } from 'primeng/api';
import { AuthService } from '@app/application/services/auth.service';
import { WorkspaceService } from '@app/application/services/workspace.service';
import { WorkspaceContextService } from '@app/application/services/workspace-context.service';
import { WorkspaceStatus } from '@app/domain';
import {
  WorkspaceSelectorComponent,
  WorkspaceOption,
} from '@app/presentation/components/molecules/workspace-selector/workspace-selector.component';
import { UserMenuComponent } from '@app/presentation/components/molecules/user-menu/user-menu.component';
import { UI_CONSTANTS } from '@app/core/constants/ui.constants';

/**
 * Header Component
 *
 * Application top bar with workspace selector, quick actions and user menu
 */
@Component({
  selector: 'app-header',

  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    ButtonModule,
    TooltipModule,
    WorkspaceSelectorComponent,
    UserMenuComponent,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit {
  toggleSidebar = output<void>();

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
    return this.workspaces().map((ws) => ({
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
      label: UI_CONSTANTS.HEADER.MENU.PROFILE,
      icon: 'pi pi-user',
      command: () => this.navigateToSettings(),
    },
    {
      label: UI_CONSTANTS.HEADER.MENU.SETTINGS,
      icon: 'pi pi-cog',
      command: () => this.navigateToSettings(),
    },
    {
      separator: true,
    },
    {
      label: UI_CONSTANTS.HEADER.MENU.LOGOUT,
      icon: 'pi pi-sign-out',
      command: () => this.logout(),
    },
  ];

  // Sync selected workspace ID with context
  private readonly syncWorkspaceIdEffect = effect(() => {
    const workspace = this.selectedWorkspace();
    if (workspace) {
      this.selectedWorkspaceId = workspace.id;
    } else {
      this.selectedWorkspaceId = null;
    }
  });

  ngOnInit(): void {
    // Wait for auth to initialize, then load workspaces
    this.initializeComponent();
  }

  private async initializeComponent(): Promise<void> {
    // Esperar a que Firebase Auth determine el estado de autenticación
    await this.authService.waitForAuthInit();

    // Solo cargar workspaces si el usuario está autenticado
    if (this.authService.isAuthenticated()) {
      await this.loadWorkspaces();
    }
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

  onWorkspaceSelected(workspaceId: string | null): void {
    if (!workspaceId) return;

    const workspace = this.workspaces().find((ws) => ws.id === workspaceId);

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
      await this.workspaceService.testConnection(workspace.id);

      this.messageService.add({
        severity: 'success',
        summary: UI_CONSTANTS.HEADER.TOAST.TEST_SUCCESS,
        detail: `El token de "${workspace.name}" es válido`,
      });

      // Reload workspaces to update status
      await this.loadWorkspaces();

      // Update context with refreshed workspace
      await this.refreshSelectedWorkspace();
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: UI_CONSTANTS.HEADER.TOAST.TEST_ERROR,
        detail:
          error instanceof Error ? error.message : UI_CONSTANTS.HEADER.TOAST.TEST_ERROR_DETAIL,
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
      await this.workspaceService.syncNow(workspace.id);

      this.messageService.add({
        severity: 'success',
        summary: UI_CONSTANTS.HEADER.TOAST.SYNC_SUCCESS,
        detail: `El workspace "${workspace.name}" se ha sincronizado correctamente`,
      });

      // Reload workspaces to update lastSyncAt
      await this.loadWorkspaces();

      // Update context with refreshed workspace
      await this.refreshSelectedWorkspace();
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: UI_CONSTANTS.HEADER.TOAST.SYNC_ERROR,
        detail:
          error instanceof Error ? error.message : UI_CONSTANTS.HEADER.TOAST.SYNC_ERROR_DETAIL,
      });
    } finally {
      this.isSyncing.set(false);
    }
  }

  /**
   * Refresh the selected workspace in context after an operation
   */
  private async refreshSelectedWorkspace(): Promise<void> {
    const currentWorkspace = this.selectedWorkspace();
    if (!currentWorkspace) return;

    // Find the updated workspace in the list
    const updatedWorkspace = this.workspaces().find((ws) => ws.id === currentWorkspace.id);
    if (updatedWorkspace) {
      this.workspaceContext.selectWorkspace(updatedWorkspace);
    }
  }

  onToggleSidebar(): void {
    this.toggleSidebar.emit();
  }

  navigateToSettings(): void {
    this.router.navigate(['/settings']);
  }

  async logout(): Promise<void> {
    this.workspaceContext.clearWorkspace();
    await this.authService.signOut();
    this.router.navigate(['/login']);
  }
}
