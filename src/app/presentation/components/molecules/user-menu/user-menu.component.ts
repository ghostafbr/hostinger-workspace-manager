import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { PopoverModule } from 'primeng/popover';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-user-menu',

  imports: [AvatarModule, PopoverModule, MenuModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="user-menu">
      <p-avatar
        [label]="initials()"
        class="user-avatar"
        shape="circle"
        (click)="userPopover.toggle($event)"
      ></p-avatar>

      <p-popover #userPopover>
        <p-menu [model]="items()" class="user-dropdown-menu" />
      </p-popover>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .user-menu {
        cursor: pointer;
      }
      :host ::ng-deep .user-avatar {
        background-color: var(--primary-100);
        color: var(--primary-700);
        font-weight: 600;
        cursor: pointer;
        transition: transform 0.2s;
      }
      :host ::ng-deep .user-avatar:hover {
        transform: scale(1.05);
        background-color: var(--primary-200);
      }
    `,
  ],
})
export class UserMenuComponent {
  initials = input.required<string>();
  items = input.required<MenuItem[]>();
}
