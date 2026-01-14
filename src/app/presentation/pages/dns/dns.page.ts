import { Component, ChangeDetectionStrategy, signal, computed, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Select } from 'primeng/select';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { ChipModule } from 'primeng/chip';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { DnsViewerComponent } from '../../components/organisms/dns-viewer/dns-viewer.component';
import { DnsComparatorComponent } from '../../components/organisms/dns-comparator/dns-comparator.component';
import { DomainService, WorkspaceContextService, DnsService } from '@app/application';
import { IDomain } from '@app/domain';
import { fadeIn, slideUp } from '@app/infrastructure';

/**
 * DNS Page
 *
 * Main page for DNS management with viewer and comparator tabs
 */
@Component({
  selector: 'app-dns-page',
  standalone: true,
  imports: [
    DnsViewerComponent,
    DnsComparatorComponent,
    FormsModule,
    Select,
    CardModule,
    ButtonModule,
    ToastModule,
    ToolbarModule,
    ChipModule,
    TooltipModule,
  ],
  templateUrl: './dns.page.html',
  styleUrl: './dns.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MessageService],
  animations: [fadeIn, slideUp],
})
export class DnsPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly domainService = inject(DomainService);
  private readonly workspaceContext = inject(WorkspaceContextService);
  private readonly dnsService = inject(DnsService);
  private readonly messageService = inject(MessageService);

  readonly domainName = signal<string>('');
  selectedDomain = '';
  readonly domains = signal<IDomain[]>([]);
  readonly isLoadingDomains = signal<boolean>(false);
  readonly isSyncingDns = computed(() => this.dnsService.isSyncing());

  readonly domainOptions = computed(() =>
    this.domains().map((domain: IDomain) => ({
      label: domain.domainName,
      value: domain.domainName
    }))
  );

  async ngOnInit(): Promise<void> {
    // Load domains for the current workspace
    await this.loadDomains();

    // Check if domain is provided via URL
    this.route.queryParams.subscribe((params) => {
      const domain = params['domain'] || '';
      if (domain) {
        this.domainName.set(domain);
        this.selectedDomain = domain;
      }
    });
  }

  private async loadDomains(): Promise<void> {
    const currentWorkspace = this.workspaceContext.getCurrentWorkspace();
    if (!currentWorkspace) {
      console.warn('[DnsPage] No workspace selected');
      return;
    }

    try {
      this.isLoadingDomains.set(true);
      const domains = await this.domainService.getAllDomains(currentWorkspace.id);
      this.domains.set(domains);
      // Forzar que el valor sea vacío tras cargar dominios para evitar doble clic en el primer uso
      this.domainName.set('');
      this.selectedDomain = '';
    } catch (error) {
      console.error('[DnsPage] Error loading domains:', error);
    } finally {
      this.isLoadingDomains.set(false);
    }
  }

  onDomainChange(value: string): void {
    this.domainName.set(value || '');
    this.selectedDomain = value || '';
  }

  async syncDnsRecords(): Promise<void> {
    const currentWorkspace = this.workspaceContext.getCurrentWorkspace();
    if (!currentWorkspace) {
      this.messageService.add({
        severity: 'warn',
        summary: 'No Workspace',
        detail: 'Please select a workspace first',
      });
      return;
    }

    try {
      this.messageService.add({
        severity: 'info',
        summary: 'Syncing DNS',
        detail: 'Fetching DNS records from Hostinger API...',
      });

      const result = await this.dnsService.syncDnsRecords(currentWorkspace.id);

      if (result.success) {
        this.messageService.add({
          severity: 'success',
          summary: 'DNS Sync Complete',
          detail: `Synced ${result.totalRecords} DNS records from ${result.domainsProcessed} domains`,
          life: 5000,
        });

        // Reload domains to ensure fresh data
        await this.loadDomains();
      } else {
        this.messageService.add({
          severity: 'error',
          summary: 'DNS Sync Failed',
          detail: `Errors: ${result.errors.join(', ')}`,
          life: 10000,
        });
      }
    } catch (error) {
      console.error('[DnsPage] Error syncing DNS records:', error);

      let errorDetail = 'Unknown error occurred';

      // Extract detailed error message from HttpErrorResponse
      if (error && typeof error === 'object' && 'error' in error) {
        const httpError = error as any;
        if (httpError.error?.error) {
          errorDetail = httpError.error.error;
        } else if (httpError.error?.message) {
          errorDetail = httpError.error.message;
        } else if (httpError.message) {
          errorDetail = httpError.message;
        }
      } else if (error instanceof Error) {
        errorDetail = error.message;
      }

      this.messageService.add({
        severity: 'error',
        summary: 'Sync Error',
        detail: errorDetail,
        life: 15000,
      });
    }
  }
}
