import { ApplicationConfig, provideZoneChangeDetection, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withFetch } from '@angular/common/http';

import { LucideAngularModule, Menu, Mail, BadgeDollarSign, Youtube, Instagram, ArrowUpFromDot, Send } from 'lucide-angular';


export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withFetch()),
   
     importProvidersFrom(LucideAngularModule.pick({ 
      Menu, 
      Mail, 
      BadgeDollarSign, 
      Youtube, 
      Instagram, 
      ArrowUpFromDot,
      Send, 
    }))
  ]
};
