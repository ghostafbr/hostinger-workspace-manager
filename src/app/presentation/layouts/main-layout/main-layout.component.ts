import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../components/organisms/sidebar/sidebar.component';
import { HeaderComponent } from '../../components/organisms/header/header.component';
import { FooterComponent } from '../../components/organisms/footer/footer.component';

/**
 * Main Layout Component
 *
 * Provides the main application layout with sidebar, header, footer and content area
 */
@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    SidebarComponent,
    HeaderComponent,
    FooterComponent,
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
})
export class MainLayoutComponent {
  readonly sidebarCollapsed = signal<boolean>(false);

  onSidebarToggle(collapsed: boolean): void {
    this.sidebarCollapsed.set(collapsed);
  }
}
