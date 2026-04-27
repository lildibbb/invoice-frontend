import { ApplicationConfig, provideZoneChangeDetection, APP_INITIALIZER } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MessageService } from 'primeng/api';
import { routes } from './app.routes';
import { jwtInterceptor } from './core/http/jwt.interceptor';
import { refreshInterceptor } from './core/http/refresh.interceptor';
import { configureApiClient } from './core/api/api-config';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(
      withInterceptors([jwtInterceptor, refreshInterceptor]),
    ),
    provideAnimationsAsync(),
    MessageService,
    {
      provide: APP_INITIALIZER,
      useFactory: () => () => configureApiClient(),
      multi: true,
    },
  ],
};
