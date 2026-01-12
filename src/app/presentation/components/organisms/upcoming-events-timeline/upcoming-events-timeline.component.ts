import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { TimelineModule } from 'primeng/timeline';
import { CardModule } from 'primeng/card';
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
  imports: [TimelineModule, CardModule, ChipModule, TooltipModule, NgClass, DatePipe],
  templateUrl: './upcoming-events-timeline.component.html',
  styleUrl: './upcoming-events-timeline.component.scss',
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
        return '#ef4444'; // red
      case 'warning':
        return '#f59e0b'; // orange
      default:
        return '#3b82f6'; // blue
    }
  }
}
