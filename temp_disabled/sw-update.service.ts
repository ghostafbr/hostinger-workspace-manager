import { Injectable, ApplicationRef, inject } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter, interval, concat } from 'rxjs';

/**
 * Service Worker Update Service
 *
 * Manages service worker updates and notifies users of new versions
 */
@Injectable({
  providedIn: 'root',
})
export class SwUpdateService {
  private readonly swUpdate = inject(SwUpdate);
  private readonly appRef = inject(ApplicationRef);

  /**
   * Initialize service worker update checks
   */
  init(): void {
    if (!this.swUpdate.isEnabled) {
      console.log('[SW] Service Worker is not enabled');
      return;
    }

    console.log('[SW] Service Worker is enabled');

    // Check for updates every 6 hours
    const appIsStable$ = this.appRef.isStable.pipe(
      filter((isStable) => isStable)
    );
    const everyHour$ = interval(6 * 60 * 60 * 1000); // 6 hours
    const everyHourOnceAppIsStable$ = concat(appIsStable$, everyHour$);

    everyHourOnceAppIsStable$.subscribe(async () => {
      try {
        const updateFound = await this.swUpdate.checkForUpdate();
        console.log('[SW] Update check:', updateFound ? 'Update available' : 'No update');
      } catch (error) {
        console.error('[SW] Failed to check for updates:', error);
      }
    });

    // Listen for version updates
    this.swUpdate.versionUpdates
      .pipe(
        filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY')
      )
      .subscribe((evt) => {
        console.log('[SW] New version available:', evt.latestVersion);

        if (confirm('Nueva versión disponible. ¿Desea actualizar ahora?')) {
          window.location.reload();
        }
      });

    // Log unrecoverable state
    this.swUpdate.unrecoverable.subscribe((event) => {
      console.error('[SW] Unrecoverable state:', event.reason);

      if (confirm(
        'La aplicación está en un estado irrecuperable. ¿Desea recargar la página?'
      )) {
        window.location.reload();
      }
    });
  }
}
