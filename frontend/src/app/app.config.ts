import { ApplicationConfig, provideZoneChangeDetection, importProvidersFrom } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';

import { LucideAngularModule, Menu, Mail, BadgeDollarSign, Youtube, Instagram, ArrowUpFromDot, Send, CircleArrowLeft } from 'lucide-angular';


import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { providePrimeNG } from 'primeng/config';
export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    importProvidersFrom(BrowserAnimationsModule),
    providePrimeNG(),
    provideRouter(
      routes,
      withInMemoryScrolling({
        scrollPositionRestoration: 'top',
      })
    ),
    provideHttpClient(withFetch()),
    
    // Firebase Config - USER MUST UPDATE THESE VALUES
    provideFirebaseApp(() => initializeApp({
        apiKey: "AIzaSyA-O5OuinkLc_Jjh2H66SAMvASSMLjn-Ew",
        authDomain: "lamed-148.firebaseapp.com",
        projectId: "lamed-148",
        storageBucket: "lamed-148.firebasestorage.app",
        messagingSenderId: "957958728332",
        appId: "1:957958728332:web:54e2654652c944048729a9",
        measurementId: "G-6XRD5FCRNY"
    })),
    provideAuth(() => getAuth()),

     importProvidersFrom(LucideAngularModule.pick({ 
      Menu, 
      Mail, 
      BadgeDollarSign, 
      Youtube, 
      Instagram, 
      ArrowUpFromDot,
      Send,
      CircleArrowLeft
    }))
  ]
};
