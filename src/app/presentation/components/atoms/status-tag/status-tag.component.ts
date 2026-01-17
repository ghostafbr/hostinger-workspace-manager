import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { TagModule } from 'primeng/tag';

export type SeverityType = 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast';

@Component({
  selector: 'app-status-tag',
  standalone: true,
  imports: [TagModule],
  template: `
    <p-tag [value]="label()" [severity]="severity()" [icon]="icon()" [rounded]="rounded()" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusTagComponent {
  value = input.required<string>();
  severityOverride = input<SeverityType>();
  icon = input<string>();
  rounded = input<boolean>(false);

  label = computed(() => this.value());

  severity = computed(() => {
    if (this.severityOverride()) return this.severityOverride();
    return this.getSeverity(this.value());
  });

  private getSeverity(status: string): SeverityType {
    if (!status) return 'secondary';

    const s = status.toLowerCase();

    if (
      s.includes('active') ||
      s.includes('activo') ||
      s.includes('success') ||
      s.includes('ok') ||
      s.includes('normal')
    ) {
      return 'success';
    }

    if (
      s.includes('pending') ||
      s.includes('pendiente') ||
      s.includes('warning') ||
      s.includes('warn') ||
      s.includes('advertencia')
    ) {
      return 'warn';
    }

    if (
      s.includes('error') ||
      s.includes('danger') ||
      s.includes('fail') ||
      s.includes('failed') ||
      s.includes('crítico') ||
      s.includes('critical') ||
      s.includes('suspended')
    ) {
      return 'danger';
    }

    if (s.includes('info')) {
      return 'info';
    }

    return 'secondary';
  }
}
