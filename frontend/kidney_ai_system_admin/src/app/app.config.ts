import { provideRouter, withRouterConfig } from '@angular/router';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { authenticationInterceptor } from './core/interceptors/authentication-interceptor';
import { errorsInterceptor } from './core/interceptors/errors.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideRouter(
      routes,
      withRouterConfig({
        paramsInheritanceStrategy: 'always',
      }),
    ),
    provideHttpClient(
      withFetch(),
      withInterceptors([errorsInterceptor, authenticationInterceptor]),
    ),
  ],
};
