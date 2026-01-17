import { Component, ChangeDetectionStrategy, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

// PrimeNG
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar'; // Added ToolbarModule
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { SkeletonModule } from 'primeng/skeleton';
import { TooltipModule } from 'primeng/tooltip';

// Services
import { DomainService } from '@app/application/services/domain.service';
import { WorkspaceContextService } from '@app/application/services/workspace-context.service';
import { ExportService } from '@app/application/services/export.service';

// Domain
import { IDomain } from '@app/domain';

// Components
import { DomainDetailsDialogComponent } from '@app/presentation/components/organisms/domain-details-dialog/domain-details-dialog.component';
import { DomainEditDialogComponent } from '@app/presentation/components/organisms/domain-edit-dialog/domain-edit-dialog.component';

// Animations
import { fadeIn, slideUp } from '@app/infrastructure';

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
    CommonModule,
    FormsModule,
    CardModule,
    ToastModule,
    ButtonModule,
    ToolbarModule,
    TableModule,
    TagModule,
    InputTextModule,
    SkeletonModule,
    TooltipModule,
    DomainDetailsDialogComponent,
    DomainEditDialogComponent,
  ],
  providers: [MessageService],
  animations: [fadeIn, slideUp],
  templateUrl: './domains.page.html',
  styleUrl: './domains.page.scss',
})
export default class DomainsPage implements OnInit {
  private readonly domainService = inject(DomainService);
  private readonly workspaceContext = inject(WorkspaceContextService);
  private readonly exportService = inject(ExportService);
  private readonly route = inject(ActivatedRoute);
  private readonly messageService = inject(MessageService);

  readonly domains = signal<IDomain[]>([]);
  readonly isLoading = this.domainService.isLoading;
  readonly error = this.domainService.error;

  // Stats Signal
  readonly stats = signal<{
    total: number;
    expired: number;
    critical: number;
    warning: number;
    active: number;
    totalValue: number;
  } | null>(null);

  readonly selectedDomain = signal<IDomain | null>(null);
  readonly showDetailsDialog = signal<boolean>(false);
  readonly showEditDialog = signal<boolean>(false);

  /**
   * Workspace name for display
   */
  readonly workspaceName = computed(() => {
    const ws = this.workspaceContext.getCurrentWorkspace();
    return ws?.name || 'Workspace';
  });

  ngOnInit(): void {
    this.route.paramMap.subscribe(() => {
      this.loadData();
    });
  }

  /**
   * Load data (domains + stats)
   */
  async loadData(): Promise<void> {
    try {
      const workspaceId = this.route.snapshot.paramMap.get('workspaceId');

      if (!workspaceId) {
        throw new Error('No se encontró el ID del workspace');
      }

      // Parallel loading
      const [domains, stats] = await Promise.all([
        this.domainService.getAllDomains(workspaceId),
        this.domainService.getDomainStatistics(workspaceId),
      ]);

      this.domains.set(domains);
      this.stats.set(stats);

      if (domains.length === 0) {
        this.messageService.add({
          severity: 'info',
          summary: 'Sin dominios',
          detail: 'No se encontraron dominios para este workspace.',
          life: 5000,
        });
      }
    } catch (error) {
       console.error('[DomainsPage] Error loading data:', error);
       this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al cargar los datos de dominios',
      });
    }
  }

  /**
   * Status Helpers
   */
  getSeverity(expiresAt: any): 'success' | 'warn' | 'danger' | 'info' {
    const status = this.domainService.getExpirationStatus(expiresAt);
    switch (status) {
      case 'ok': return 'success';
      case 'warning': return 'warn';
      case 'critical':
      case 'expired': return 'danger';
      default: return 'info';
    }
  }

  getStatusLabel(expiresAt: any): string {
    const status = this.domainService.getExpirationStatus(expiresAt);
    const days = this.domainService.getDaysUntilExpiration(expiresAt);

    if (status === 'expired') return `Vencido (${Math.abs(days || 0)}d)`;
    if (days !== null) return `${days} días`;
    return 'Desconocido';
  }

  getStatusIcon(expiresAt: any): string {
    const status = this.domainService.getExpirationStatus(expiresAt);
    switch (status) {
        case 'ok': return 'fa fa-check-circle';
        case 'warning': return 'fa fa-exclamation-triangle';
        case 'critical': return 'fa fa-exclamation-circle';
        case 'expired': return 'fa fa-times-circle';
        default: return 'fa fa-question-circle';
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

  /**
   * Open edit dialog for a domain
   */
  onEditDomain(domain: IDomain): void {
    this.selectedDomain.set(domain);
    this.showEditDialog.set(true);
  }

  /**
   * Handle edit dialog visibility change
   */
  onEditDialogVisibilityChange(visible: boolean): void {
    this.showEditDialog.set(visible);
    if (!visible) {
      this.selectedDomain.set(null);
    }
  }

  /**
   * Export domains to CSV
   */
  exportToCSV(): void {
    const domains = this.domains();
    if (domains.length === 0) return;

    const exportData = domains.map((domain) => ({
      Dominio: domain.domainName,
      Workspace: this.workspaceName(),
      'Fecha de Vencimiento': this.formatDate(domain.expiresAt),
      Estado: this.domainService.getExpirationStatus(domain.expiresAt),
    }));

    const filename = `dominios-${this.workspaceName().replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.csv`;
    this.exportService.exportToCSV(exportData, filename);

    this.messageService.add({
      severity: 'success',
      summary: 'Exportado',
      detail: `Datos exportados a ${filename}`,
      life: 3000,
    });
  }

  formatDate(date: unknown): string {
    if (!date) return '';
    if (date instanceof Date) return date.toLocaleDateString();
    if (typeof date === 'object' && 'toDate' in date) {
      return (date as { toDate: () => Date }).toDate().toLocaleDateString();
    }
    return String(date);
  }

  /**
   * Handle domain updated event
   */
  onDomainUpdated(): void {
    this.messageService.add({
      severity: 'success',
      summary: 'Dominio actualizado',
      detail: 'Los cambios se guardaron correctamente',
    });
    this.loadData();
  }
}
