import {
  animate,
  query,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';

/**
 * Centralized Angular animations for consistent UX
 *
 * Usage:
 * import { fadeIn, slideInLeft } from '@app/infrastructure/utils/animations';
 *
 * @Component({
 *   animations: [fadeIn, slideInLeft]
 * })
 */

/**
 * Fade In animation
 * Triggers: void => *, * => void
 */
export const fadeIn = trigger('fadeIn', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate('300ms ease-in', style({ opacity: 1 })),
  ]),
  transition(':leave', [
    animate('200ms ease-out', style({ opacity: 0 })),
  ]),
]);

/**
 * Slide In from Left
 * Triggers: void => *
 */
export const slideInLeft = trigger('slideInLeft', [
  transition(':enter', [
    style({ transform: 'translateX(-100%)', opacity: 0 }),
    animate('400ms cubic-bezier(0.35, 0, 0.25, 1)', style({ transform: 'translateX(0)', opacity: 1 })),
  ]),
]);

/**
 * Slide In from Right
 * Triggers: void => *
 */
export const slideInRight = trigger('slideInRight', [
  transition(':enter', [
    style({ transform: 'translateX(100%)', opacity: 0 }),
    animate('400ms cubic-bezier(0.35, 0, 0.25, 1)', style({ transform: 'translateX(0)', opacity: 1 })),
  ]),
]);

/**
 * Slide Up from Bottom
 * Triggers: void => *
 */
export const slideUp = trigger('slideUp', [
  transition(':enter', [
    style({ transform: 'translateY(20px)', opacity: 0 }),
    animate('350ms cubic-bezier(0.35, 0, 0.25, 1)', style({ transform: 'translateY(0)', opacity: 1 })),
  ]),
]);

/**
 * Scale Up animation (great for buttons, cards)
 * Triggers: void => *
 */
export const scaleIn = trigger('scaleIn', [
  transition(':enter', [
    style({ transform: 'scale(0.8)', opacity: 0 }),
    animate('250ms cubic-bezier(0.35, 0, 0.25, 1)', style({ transform: 'scale(1)', opacity: 1 })),
  ]),
]);

/**
 * List Stagger animation
 * Animates children sequentially with delay
 */
export const listStagger = trigger('listStagger', [
  transition('* => *', [
    query(':enter', [
      style({ opacity: 0, transform: 'translateY(15px)' }),
      animate('400ms cubic-bezier(0.35, 0, 0.25, 1)', style({ opacity: 1, transform: 'translateY(0)' })),
    ], { optional: true }),
  ]),
]);

/**
 * Expand/Collapse animation for accordions
 */
export const expandCollapse = trigger('expandCollapse', [
  state('collapsed', style({
    height: '0',
    opacity: 0,
    overflow: 'hidden',
  })),
  state('expanded', style({
    height: '*',
    opacity: 1,
  })),
  transition('collapsed <=> expanded', [
    animate('300ms cubic-bezier(0.4, 0.0, 0.2, 1)'),
  ]),
]);

/**
 * Router transition animation
 * Use in component's animations array
 */
export const routerTransition = trigger('routerTransition', [
  transition('* <=> *', [
    // Slide out current route
    query(':leave', [
      style({ position: 'absolute', width: '100%', opacity: 1 }),
      animate('200ms ease-out', style({ opacity: 0, transform: 'translateX(-50px)' })),
    ], { optional: true }),
    // Slide in new route
    query(':enter', [
      style({ opacity: 0, transform: 'translateX(50px)' }),
      animate('300ms ease-in', style({ opacity: 1, transform: 'translateX(0)' })),
    ], { optional: true }),
  ]),
]);

/**
 * Shake animation for errors
 */
export const shake = trigger('shake', [
  transition('* => error', [
    animate('400ms', style({ transform: 'translateX(0)' })),
    animate('100ms', style({ transform: 'translateX(-10px)' })),
    animate('100ms', style({ transform: 'translateX(10px)' })),
    animate('100ms', style({ transform: 'translateX(-10px)' })),
    animate('100ms', style({ transform: 'translateX(10px)' })),
    animate('100ms', style({ transform: 'translateX(0)' })),
  ]),
]);

/**
 * Pulse animation for notifications/badges
 */
export const pulse = trigger('pulse', [
  transition('* => pulse', [
    animate('1000ms', style({ transform: 'scale(1)' })),
    animate('500ms', style({ transform: 'scale(1.1)' })),
    animate('500ms', style({ transform: 'scale(1)' })),
  ]),
]);

/**
 * Rotation animation (for loading/refresh icons)
 */
export const rotate = trigger('rotate', [
  state('default', style({ transform: 'rotate(0deg)' })),
  state('rotated', style({ transform: 'rotate(360deg)' })),
  transition('default <=> rotated', [
    animate('500ms cubic-bezier(0.4, 0.0, 0.2, 1)'),
  ]),
]);

/**
 * Bounce animation for success feedback
 */
export const bounce = trigger('bounce', [
  transition('* => success', [
    style({ transform: 'scale(1)' }),
    animate('200ms', style({ transform: 'scale(1.2)' })),
    animate('200ms', style({ transform: 'scale(0.9)' })),
    animate('200ms', style({ transform: 'scale(1.05)' })),
    animate('150ms', style({ transform: 'scale(1)' })),
  ]),
]);
