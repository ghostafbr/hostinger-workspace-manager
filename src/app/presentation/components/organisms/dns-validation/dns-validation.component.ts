import { Component, Input, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DnsService } from '@app/application/services/dns.service';
import { DnsValidationResult, DnsCheckStatus, DnsValidationStatus } from '@app/domain';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { AccordionModule } from 'primeng/accordion';
import { ProgressBarModule } from 'primeng/progressbar';
import { MessageModule } from 'primeng/message';

@Component({
  selector: 'app-dns-validation',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    CardModule,
    TagModule,
    AccordionModule,
    ProgressBarModule,
    MessageModule
  ],
  template: `
    <div class="dns-validation-container" *ngIf="validationResult(); else emptyState">
      <!-- Health Header -->
      <div class="health-header mb-4">
        <p-card>
          <div class="flex flex-column md:flex-row align-items-center justify-content-between gap-4">
            <div class="flex align-items-center gap-3">
              <div class="health-score-ring" [ngClass]="getHealthColorClass()">
                <span class="score">{{ validationResult()?.score ?? 0 }}</span>
                <span class="label">Health</span>
              </div>
              <div>
                <h2 class="m-0 text-xl font-bold">DNS Health Status</h2>
                <p class="text-600 m-0">
                  Validated at {{ validationResult()?.validatedAt?.toDate() | date:'short' }}
                </p>
              </div>
            </div>
            
            <div class="flex gap-2">
              <p-tag 
                [severity]="getStatusSeverity(validationResult()?.status)" 
                [value]="(validationResult()?.status | uppercase) ?? ''">
              </p-tag>
            </div>
          </div>
        </p-card>
      </div>

      <!-- Validation Checks -->
      <div class="checks-list">
        <p-accordion [multiple]="true" [value]="['critical', 'warnings']">
          <p-accordion-panel value="critical" *ngIf="failures().length > 0">
              <p-accordion-header>Critical Issues</p-accordion-header>
              <p-accordion-content>
                 <div *ngFor="let check of failures()" class="check-item fail mb-3 p-3 border-round">
                    <div class="flex align-items-start gap-3">
                        <i class="pi pi-times-circle text-red-500 text-xl mt-1"></i>
                        <div>
                            <h4 class="m-0 font-bold text-red-600">{{ check.name }}</h4>
                            <p class="m-0 mt-1 text-900">{{ check.message }}</p>
                            <div *ngIf="check.recommendation" class="mt-2 text-sm text-700 bg-red-50 p-2 border-round inline-block">
                               <i class="pi pi-info-circle mr-1"></i> 
                               <strong>Fix:</strong> {{ check.recommendation }}
                            </div>
                        </div>
                    </div>
                 </div>
              </p-accordion-content>
          </p-accordion-panel>

          <p-accordion-panel value="warnings" *ngIf="warnings().length > 0">
            <p-accordion-header>Warnings</p-accordion-header>
            <p-accordion-content>
                <div *ngFor="let check of warnings()" class="check-item warn mb-3 p-3 border-round">
                    <div class="flex align-items-start gap-3">
                        <i class="pi pi-exclamation-triangle text-orange-500 text-xl mt-1"></i>
                        <div>
                            <h4 class="m-0 font-bold text-orange-600">{{ check.name }}</h4>
                            <p class="m-0 mt-1 text-900">{{ check.message }}</p>
                            <div *ngIf="check.recommendation" class="mt-2 text-sm text-700 bg-orange-50 p-2 border-round inline-block">
                               <i class="pi pi-info-circle mr-1"></i>
                               <strong>Suggestion:</strong> {{ check.recommendation }}
                            </div>
                        </div>
                    </div>
                 </div>
            </p-accordion-content>
          </p-accordion-panel>

          <p-accordion-panel value="passed" *ngIf="passes().length > 0">
            <p-accordion-header>Passed Checks</p-accordion-header>
            <p-accordion-content>
                <div *ngFor="let check of passes()" class="check-item pass mb-2 p-2 px-3 border-round flex align-items-center gap-2">
                    <i class="pi pi-check-circle text-green-500 text-lg"></i>
                    <span class="text-900">{{ check.name }}: {{ check.message }}</span>
                </div>
            </p-accordion-content>
          </p-accordion-panel>
        </p-accordion>
      </div>
    </div>

    <ng-template #emptyState>
      <div class="text-center p-5 border-dashed border-1 border-300 border-round">
        <i class="pi pi-shield text-500 text-4xl mb-3"></i>
        <h3 class="text-900 m-0">No Validation Results</h3>
        <p class="text-600 mb-4">Run a DNS validation to check for security and configuration issues.</p>
        <p-button 
            label="Run Validation" 
            icon="pi pi-play" 
            (onClick)="validate()" 
            [loading]="dnsService.isLoading()"></p-button>
      </div>
    </ng-template>
  `,
  styles: [`
    .health-score-ring {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        border: 4px solid #e5e7eb;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        
        // Dynamic colors handled by class
        &.success { border-color: var(--green-500); color: var(--green-600); }
        &.warning { border-color: var(--orange-500); color: var(--orange-600); }
        &.error { border-color: var(--red-500); color: var(--red-600); }

        .score { font-size: 1.25rem; font-weight: 800; line-height: 1; }
        .label { font-size: 0.6rem; text-transform: uppercase; font-weight: 600; }
    }

    .check-item {
        &.fail { background-color: #fff5f5; border: 1px solid #fed7d7; }
        &.warn { background-color: #fffaf0; border: 1px solid #feebc8; }
        &.pass { background-color: #f0fff4; border: 1px solid #c6f6d5; }
    }
  `]
})
export class DnsValidationComponent {
  dnsService = inject(DnsService);
  
  @Input() domainName!: string;

  validationResult = this.dnsService.validationResults;

  failures = computed(() => {
    return this.validationResult()?.checks.filter(c => c.status === DnsCheckStatus.FAIL) || [];
  });

  warnings = computed(() => {
    return this.validationResult()?.checks.filter(c => c.status === DnsCheckStatus.WARN) || [];
  });

  passes = computed(() => {
    return this.validationResult()?.checks.filter(c => c.status === DnsCheckStatus.PASS) || [];
  });

  getHealthColorClass(): string {
    const result = this.validationResult();
    if (!result) return '';
    
    switch(result.status) {
        case DnsValidationStatus.HEALTHY: return 'success';
        case DnsValidationStatus.WARNINGS: return 'warning';
        case DnsValidationStatus.ERRORS: return 'error';
        default: return '';
    }
  }

  getStatusSeverity(status?: DnsValidationStatus): 'success' | 'warn' | 'danger' | undefined {
    switch(status) {
        case DnsValidationStatus.HEALTHY: return 'success';
        case DnsValidationStatus.WARNINGS: return 'warn';
        case DnsValidationStatus.ERRORS: return 'danger';
        default: return undefined;
    }
  }

  validate(): void {
    if (this.domainName) {
        this.dnsService.validateDns(this.domainName);
    }
  }
}
