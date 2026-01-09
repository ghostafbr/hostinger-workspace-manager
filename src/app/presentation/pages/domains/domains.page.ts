import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  inject,
  signal,
  computed,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';

// PrimeNG
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

// Services
import { DomainService, DomainFilters } from '@app/application/services/domain.service';
import { WorkspaceContextService } from '@app/application/services/workspace-context.service';

// Domain
import { IDomain } from '@app/domain';

// Components
import { DomainsTableComponent } from '@app/presentation/components/organisms/domains-table/domains-table.component';
import { DomainDetailsDialogComponent } from '@app/presentation/components/organisms/domain-details-dialog/domain-details-dialog.component';

/**
 * Domains Page
 *
 * Shows filterable table of domains for the current workspace
 */
@Component({
  selector: 'app-domains',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CardModule,
    ToastModule,
    DomainsTableComponent,
    DomainDetailsDialogComponent,
  ],
  providers: [MessageService],
  templateUrl: './domains.page.html',
  styleUrl: './domains.page.scss',
})
export default class DomainsPage implements OnInit {
  private readonly domainService = inject(DomainService);
  private readonly workspaceContext = inject(WorkspaceContextService);
  private readonly route = inject(ActivatedRoute);
  private readonly messageService = inject(MessageService);

  readonly domains = signal<IDomain[]>([]);
  readonly isLoading = this.domainService.isLoading;
  readonly error = this.domainService.error;

  readonly selectedDomain = signal<IDomain | null>(null);
  readonly showDetailsDialog = signal<boolean>(false);

  /**
   * Workspace name for display
   */
  readonly workspaceName = computed(() => {
    const ws = this.workspaceContext.getCurrentWorkspace();
    return ws?.name || 'Workspace';
  });

  /**
   * Total domains count
   */
  readonly totalDomains = computed(() => this.domains().length);

  ngOnInit(): void {
    this.loadDomains();
  }

  /**
   * Load all domains for current workspace
   */
  async loadDomains(): Promise<void> {
    try {
      const workspaceId = this.route.snapshot.paramMap.get('workspaceId');
      console.log('[DomainsPage] Loading domains for workspaceId:', workspaceId);

      if (!workspaceId) {
        throw new Error('No se encontró el ID del workspace');
      }

      const domains = await this.domainService.getAllDomains(workspaceId);
      console.log('[DomainsPage] Loaded', domains.length, 'domains');

      this.domains.set(domains);

      if (domains.length === 0) {
        this.messageService.add({
          severity: 'info',
          summary: 'Sin dominios',
          detail: 'No se encontraron dominios para este workspace. Asegúrate de haber ejecutado la sincronización.',
          life: 5000,
        });
      }
    } catch (error) {
      console.error('[DomainsPage] Error loading domains:', error);

      let errorDetail = error instanceof Error ? error.message : 'Error al cargar dominios';

      // Check for index error
      if (error instanceof Error && error.message.includes('index')) {
        errorDetail = 'El índice de Firestore está construyéndose. Espera unos minutos y recarga la página.';
      }

      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: errorDetail,
      });
    }
  }

  /**
   * Handle domain click - open details dialog
   */
  onDomainClicked(domain: IDomain): void {
    this.selectedDomain.set(domain);
    this.showDetailsDialog.set(true);
  }

  /**
   * Handle dialog visibility change
   */
  onDialogVisibilityChange(visible: boolean): void {
    this.showDetailsDialog.set(visible);
    if (!visible) {
      this.selectedDomain.set(null);
    }
  }
}
