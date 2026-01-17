import { Component, ChangeDetectionStrategy, input, output, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';

@Component({
  selector: 'app-search-input',

  imports: [FormsModule, InputTextModule, IconFieldModule, InputIconModule],
  template: `
    <p-iconfield iconPosition="left">
      <p-inputicon class="pi pi-search" />
      <input
        type="text"
        pInputText
        [placeholder]="placeholder()"
        [(ngModel)]="value"
        (input)="handleInput($event)"
        class="w-full"
      />
    </p-iconfield>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        max-width: 300px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchInputComponent {
  value = model<string>('');
  placeholder = input<string>('Buscar...');
  onInput = output<string>();

  handleInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.onInput.emit(target.value);
  }
}
