import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { TimelineModule } from 'primeng/timeline';

import { ChipModule } from 'primeng/chip';
import { TooltipModule } from 'primeng/tooltip';
import { NgClass, DatePipe } from '@angular/common';

export interface TimelineEvent {
  id: string;
  title: string;
  type: 'domain' | 'subscription';
  expirationDate: Date;
  workspaceName: string;
  daysUntilExpiration: number;
  status: 'critical' | 'warning' | 'info';
}

/**
 * Upcoming Events Timeline Component
 *
 * Displays a timeline of upcoming domain and subscription expirations
 */
@Component({
  selector: 'app-upcoming-events-timeline',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TimelineModule, ChipModule, TooltipModule, NgClass, DatePipe],
  template: `
    <div class="glass-events-card">
      <div class="card-header">
        <div class="header-title">
          <div class="icon-indicator">
            <i class="pi pi-calendar"></i>
          </div>
          <h3>{{ title() }}</h3>
        </div>
        @if (sortedEvents().length > 0) {
          <span class="count-badge">
            {{ sortedEvents().length }} evento{{ sortedEvents().length !== 1 ? 's' : '' }}
          </span>
        }
      </div>

      @if (sortedEvents().length === 0) {
        <div class="empty-state">
          <div class="empty-icon">
            <i class="pi pi-check-circle"></i>
          </div>
          <p>No hay vencimientos próximos</p>
        </div>
      } @else {
        <div class="timeline-container">
          <p-timeline [value]="sortedEvents()" align="left" class="custom-timeline">
            <ng-template pTemplate="marker" let-event>
              <div
                class="timeline-marker"
                [class.marker-domain]="event.type === 'domain'"
                [class.marker-subscription]="event.type === 'subscription'"
              >
                <i [class]="getIcon(event.type)"></i>
              </div>
            </ng-template>

            <ng-template pTemplate="content" let-event>
              <div class="event-card">
                <div class="event-header">
                  <span class="event-title">{{ event.title }}</span>
                  <span class="days-badge" [ngClass]="'status-' + event.status">
                    {{ event.daysUntilExpiration }} días
                  </span>
                </div>

                <div class="event-details">
                  <div class="detail-item">
                    <i class="pi pi-briefcase"></i>
                    <span>{{ event.workspaceName }}</span>
                  </div>
                  <div class="detail-item">
                    <i class="pi pi-clock"></i>
                    <span>{{ event.expirationDate | date: 'dd/MM/yyyy' }}</span>
                  </div>
                </div>

                <div class="event-tags">
                  <span
                    class="mini-tag"
                    [class.tag-domain]="event.type === 'domain'"
                    [class.tag-sub]="event.type === 'subscription'"
                  >
                    {{ event.type === 'domain' ? 'Dominio' : 'Suscripción' }}
                  </span>
                </div>
              </div>
            </ng-template>
          </p-timeline>
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
    .glass-events-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
      transition: box-shadow 0.2s;
    }
    .glass-events-card:hover {
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }
    .card-header {
      margin-bottom: 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .card-header .header-title {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .card-header .header-title .icon-indicator {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: var(--surface-50);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--primary-color);
      border: 1px solid #e2e8f0;
    }
    .card-header .header-title .icon-indicator i { font-size: 1.2rem; }
    .card-header .header-title h3 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: #1e293b;
    }
    .card-header .count-badge {
      background: var(--surface-100);
      color: #64748b;
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.875rem;
      font-weight: 500;
    }
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 2rem;
      text-align: center;
    }
    .empty-state .empty-icon {
      width: 64px;
      height: 64px;
      background: var(--surface-50);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1rem;
    }
    .empty-state .empty-icon i {
      font-size: 2rem;
      color: #94a3b8;
    }
    .empty-state p {
      color: #64748b;
      font-size: 1rem;
      font-weight: 500;
    }
    ::ng-deep .custom-timeline .p-timeline-event-opposite { display: none; }
    ::ng-deep .custom-timeline .p-timeline-event-connector { background-color: #e2e8f0; }
    .timeline-marker {
      width: 2.5rem;
      height: 2.5rem;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 1rem;
      box-shadow: 0 0 0 4px #ffffff;
      z-index: 1;
    }
    .timeline-marker.marker-domain { background: #475569; }
    .timeline-marker.marker-subscription { background: #64748b; }
    .event-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 1rem 1.25rem;
      margin-bottom: 2rem;
      margin-left: 1rem;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .event-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      border-color: #cbd5e1;
    }
    .event-card .event-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 0.75rem;
    }
    .event-card .event-header .event-title {
      font-weight: 600;
      color: #1e293b;
      font-size: 1rem;
      margin-right: 1rem;
    }
    .event-card .event-header .days-badge {
      font-size: 0.75rem;
      padding: 0.25rem 0.5rem;
      border-radius: 6px;
      font-weight: 600;
      white-space: nowrap;
    }
    .event-card .event-header .days-badge.status-critical {
      background: #fee2e2;
      color: #ef4444;
    }
    .event-card .event-header .days-badge.status-warning {
      background: #fef3c7;
      color: #f59e0b;
    }
    .event-card .event-header .days-badge.status-info {
      background: #dbeafe;
      color: #3b82f6;
    }
    .event-card .event-details {
      display: flex;
      gap: 1.5rem;
      margin-bottom: 0.75rem;
    }
    .event-card .event-details .detail-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #64748b;
      font-size: 0.875rem;
    }
    .event-card .event-details .detail-item i { font-size: 0.875rem; }
    .event-card .event-tags {
      display: flex;
      gap: 0.5rem;
    }
    .event-card .event-tags .mini-tag {
      font-size: 0.75rem;
      padding: 2px 8px;
      border-radius: 4px;
      color: #64748b;
      font-weight: 500;
      border: 1px solid #e2e8f0;
    }
    .event-card .event-tags .mini-tag.tag-domain {
      background: #f1f5f9;
      color: #475569;
    }
    .event-card .event-tags .mini-tag.tag-sub {
      background: #f8fafc;
      color: #64748b;
    }
  `],
})
export class UpcomingEventsTimelineComponent {
  /**
   * Timeline events to display
   */
  readonly events = input.required<TimelineEvent[]>();

  /**
   * Timeline title
   */
  readonly title = input<string>('Próximos Vencimientos');

  /**
   * Maximum number of events to show
   */
  readonly maxEvents = input<number>(10);

  /**
   * Sorted and limited events
   */
  readonly sortedEvents = computed(() => {
    const allEvents = this.events();
    return allEvents
      .sort((a, b) => a.daysUntilExpiration - b.daysUntilExpiration)
      .slice(0, this.maxEvents());
  });

  /**
   * Get severity for chip based on status
   */
  getSeverity(status: 'critical' | 'warning' | 'info'): 'danger' | 'warn' | 'info' {
    switch (status) {
      case 'critical':
        return 'danger';
      case 'warning':
        return 'warn';
      default:
        return 'info';
    }
  }

  /**
   * Get icon based on event type
   */
  getIcon(type: 'domain' | 'subscription'): string {
    return type === 'domain' ? 'pi pi-globe' : 'pi pi-shopping-cart';
  }

  /**
   * Get color based on status
   */
  getColor(status: 'critical' | 'warning' | 'info'): string {
    switch (status) {
      case 'critical':
        return '#374151'; // dark gray
      case 'warning':
        return '#4b5563'; // medium gray
      default:
        return '#6b7280'; // light gray
    }
  }
}
