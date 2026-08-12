import {
  ApplicationConfig,
  provideZoneChangeDetection,
  provideAppInitializer,
  inject,
  importProvidersFrom,
  LOCALE_ID,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getAuth, provideAuth } from '@angular/fire/auth';
import {
  getAnalytics,
  provideAnalytics,
  ScreenTrackingService,
  UserTrackingService,
} from '@angular/fire/analytics';
import { environment } from '../environments/environment';
import {
  LucideAngularModule,
  Menu,
  ArrowLeft,
  Calendar,
  User,
  FileQuestion,
  ChevronUp,
  ChevronDown,
  Search,
  Lock,
  Mail,
  Key,
  Loader2,
  RefreshCw,
  Plus,
  LayoutList,
  AlertCircle,
  BookOpen,
  Library,
  Download,
  DownloadCloud,
  Map,
  Image,
  Monitor,
  Book,
  FileText,
  Headphones,
  File,
  PlayCircle,
  Link,
  Inbox,
  Tag,
  Star,
  Pencil,
  Trash2,
  X,
  Check,
  CheckCircle,
  Heart,
  Youtube,
  ExternalLink,
  Video,
  Smartphone,
} from 'lucide-angular';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import { routes } from './app.routes';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { SeoService } from './core/services/seo.service';

registerLocaleData(localePt);

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
    provideClientHydration(),
    provideAnimationsAsync(),
    provideAppInitializer(() => {
      const seo = inject(SeoService);
      seo.init();
    }),
    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: false,
        },
      },
    }),
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideFirestore(() => getFirestore()),
    provideAuth(() => getAuth()),
    provideAnalytics(() => getAnalytics()),
    ScreenTrackingService,
    UserTrackingService,
    importProvidersFrom(
      LucideAngularModule.pick({
        Menu,
        ArrowLeft,
        Calendar,
        User,
        FileQuestion,
        ChevronUp,
        ChevronDown,
        Search,
        Lock,
        Mail,
        Key,
        Loader2,
        RefreshCw,
        Plus,
        LayoutList,
        AlertCircle,
        BookOpen,
        Library,
        Download,
        DownloadCloud,
        Map,
        Image,
        Monitor,
        Book,
        FileText,
        Headphones,
        File,
        PlayCircle,
        Link,
        Inbox,
        Tag,
        Star,
        Pencil,
        Trash2,
        X,
        Check,
        CheckCircle,
        Heart,
        Youtube,
        ExternalLink,
        Video,
        Smartphone,
      }),
    ),
    { provide: LOCALE_ID, useValue: 'pt-BR' },
  ],
};
