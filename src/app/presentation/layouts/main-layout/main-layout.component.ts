import { Component, signal, HostListener } from '@angular/core';
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
  // Initialize collapsed based on screen size
  readonly sidebarCollapsed = signal<boolean>(this.isMobileView());
  readonly isMobile = signal<boolean>(this.isMobileView());

  private isMobileView(): boolean {
    return typeof window !== 'undefined' && window.innerWidth < 768;
  }

  @HostListener('window:resize')
  onResize(): void {
    const mobile = this.isMobileView();
    this.isMobile.set(mobile);

    // Auto-collapse sidebar on mobile when resizing
    if (mobile && !this.sidebarCollapsed()) {
      this.sidebarCollapsed.set(true);
    }
  }

  onSidebarToggle(collapsed: boolean): void {
    this.sidebarCollapsed.set(collapsed);
  }
}
