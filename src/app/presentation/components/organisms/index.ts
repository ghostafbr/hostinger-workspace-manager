// Barrel export for organisms
export * from './header/header.component';
export * from './footer/footer.component';
export * from './sidebar/sidebar.component';

// Dashboard components
export { ExpirationTrendsChartComponent } from './expiration-trends-chart/expiration-trends-chart.component';
export { UpcomingEventsTimelineComponent } from './upcoming-events-timeline/upcoming-events-timeline.component';

// Export types
export type { ExpirationTrendData } from './expiration-trends-chart/expiration-trends-chart.component';
export type { TimelineEvent } from './upcoming-events-timeline/upcoming-events-timeline.component';
