import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideIcons } from '@ng-icons/core';
import { lucideMail, lucideMailOpen, lucideCircleDollarSign, lucideYoutube, lucideInstagram, lucideArrowUpFromDot } from '@ng-icons/lucide';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideIcons({ lucideMail, lucideMailOpen, lucideCircleDollarSign, lucideYoutube, lucideInstagram, lucideArrowUpFromDot })
  ]
};
