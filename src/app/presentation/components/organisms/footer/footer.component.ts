import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TagModule } from 'primeng/tag';
import { environment } from '@app/../environments/environment';

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
  standalone: true,
  imports: [CommonModule, TagModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent {
  readonly currentYear = new Date().getFullYear();
  readonly appVersion = environment.version || '1.0.0';

  // Placeholder for last global sync (TODO: connect with real sync service)
  readonly lastGlobalSync = signal<string | null>(null);

  // Placeholder for health status (TODO: connect with real health check)
  readonly healthStatus = computed<HealthStatus>(() => {
    // Simular estado de salud
    return {
      label: 'Operativo',
      severity: 'success',
    };
  });
}
