import {
  ApplicationConfig,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { providePrimeNG } from 'primeng/config';
import { MessageService } from 'primeng/api';
import lara from '@primeng/themes/lara';

import { routes } from './app.routes';
import { FirebaseAdapter } from './infrastructure/adapters';

/**
 * Initialize Firebase before the app starts
 */
function initializeFirebase(): () => void {
  return () => {
    FirebaseAdapter.initialize();
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(withFetch()),
    provideAppInitializer(initializeFirebase()),
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
