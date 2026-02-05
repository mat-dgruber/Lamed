
import { Injectable, inject } from '@angular/core';
import { Analytics, logEvent } from '@angular/fire/analytics';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private analytics = inject(Analytics);

  constructor() {}

  // Initialization is handled automatically by provider in app.config.ts

  trackEvent(eventName: string, eventParams: any = {}) {
    logEvent(this.analytics, eventName, eventParams);
  }
}
