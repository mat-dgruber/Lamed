import { ApplicationConfig, provideZoneChangeDetection, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

import { LucideAngularModule, Menu, Mail, BadgeDollarSign, Youtube, Instagram, ArrowUpFromDot, Send } from 'lucide-angular';


export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
   
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
