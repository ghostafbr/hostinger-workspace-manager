import {
  ApplicationConfig,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  // isDevMode,
} from '@angular/core';
import { provideRouter, withPreloading } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withFetch } from '@angular/common/http';
// import { provideServiceWorker } from '@angular/service-worker';
import { providePrimeNG } from 'primeng/config';
import { MessageService } from 'primeng/api';
import lara from '@primeng/themes/lara';

import { routes } from './app.routes';
import { FirebaseAdapter } from './infrastructure/adapters';
import { CustomPreloadingStrategy } from './infrastructure/strategies/preload-strategy';
// import { SwUpdateService } from './application/services/sw-update.service';

/**
 * Initialize Firebase before the app starts
 */
function initializeFirebase(): () => void {
  return () => {
    FirebaseAdapter.initialize();
  };
}

/**
 * Initialize Service Worker updates
 * Comentado hasta instalar @angular/service-worker con: ng add @angular/pwa
 */
// function initializeServiceWorker(swUpdate: SwUpdateService): () => void {
//   return () => {
//     swUpdate.init();
//   };
// }

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withPreloading(CustomPreloadingStrategy)),
    provideAnimationsAsync(),
    provideHttpClient(withFetch()),
    provideAppInitializer(initializeFirebase()),

    // Service Worker - Descomentar después de: ng add @angular/pwa
    // provideServiceWorker('ngsw-worker.js', {
    //   enabled: !isDevMode(),
    //   registrationStrategy: 'registerWhenStable:30000',
    // }),
    // provideAppInitializer(() => {
    //   const swUpdate = inject(SwUpdateService);
    //   swUpdate.init();
    // }),

    MessageService,
    providePrimeNG({
      theme: {
        preset: lara,
        options: {
          darkModeSelector: '.dark-mode',
        },
      },
    }),
  ],
};
