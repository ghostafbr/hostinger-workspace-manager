import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

export type ButtonActionType = 'view' | 'edit' | 'delete' | 'custom';

@Component({
  selector: 'app-action-button',
  standalone: true,
  imports: [ButtonModule, TooltipModule],
  template: `
    <p-button
      [icon]="iconName()"
      [rounded]="true"
      [text]="true"
      [severity]="severity()"
      [pTooltip]="tooltip()"
      tooltipPosition="top"
      (onClick)="onClick.emit($event)"
      size="small"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActionButtonComponent {
  action = input<ButtonActionType>('view');
  tooltip = input<string>('');
  customIcon = input<string>();

  onClick = output<MouseEvent>();

  protected iconName = () => {
    if (this.customIcon()) return this.customIcon();

    switch (this.action()) {
      case 'view':
        return 'pi pi-eye';
      case 'edit':
        return 'pi pi-pencil';
      case 'delete':
        return 'pi pi-trash';
      default:
        return 'pi pi-cog';
    }
  };

  protected severity = () => {
    switch (this.action()) {
      case 'delete':
        return 'danger';
      case 'edit':
        return 'secondary';
      default:
        return 'info';
    }
  };
}
