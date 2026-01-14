import { Injectable } from '@angular/core';
import { PreloadingStrategy, Route } from '@angular/router';
import { Observable, of, timer } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

/**
 * Custom Preloading Strategy
 *
 * Preloads routes after a delay to avoid blocking initial render.
 * Only preloads routes marked with data: { preload: true }
 */
@Injectable({
  providedIn: 'root',
})
export class CustomPreloadingStrategy implements PreloadingStrategy {
  preload(route: Route, load: () => Observable<unknown>): Observable<unknown> {
    // Check if route should be preloaded
    if (route.data && route.data['preload']) {
      const delay = route.data['preloadDelay'] || 2000; // Default 2s delay

      // Delay preloading to allow critical resources to load first
      return timer(delay).pipe(
        mergeMap(() => {
          return load();
        }),
      );
    }

    return of(null);
  }
}
