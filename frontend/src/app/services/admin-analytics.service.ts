import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AnalyticsSummary {
  configured: boolean;
  property_id?: string;
  message?: string;
  error?: string;
  summary: {
    active_users: number;
    active_users_prev?: number;
    active_users_growth?: number;
    sessions: number;
    sessions_prev?: number;
    sessions_growth?: number;
    page_views: number;
    page_views_prev?: number;
    page_views_growth?: number;
    avg_duration_seconds: number;
    bounce_rate: number;
  };
}

export interface RealtimeAnalytics {
  configured: boolean;
  active_users_now: number;
  top_active_pages: Array<{ path: string; users: number }>;
}

export interface TopContentItem {
  path: string;
  title: string;
  views: number;
  users: number;
}

export interface TrafficSourceItem {
  source: string;
  sessions: number;
  percentage: number;
}

@Injectable({
  providedIn: 'root',
})
export class AdminAnalyticsService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getStatus(): Observable<{ configured: boolean; property_id: string | null }> {
    return this.http
      .get<{ configured: boolean; property_id: string | null }>(`${this.apiUrl}/admin/analytics/status`)
      .pipe(
        catchError(() =>
          of({ configured: false, property_id: null })
        )
      );
  }

  getOverview(days: number = 30): Observable<AnalyticsSummary> {
    return this.http
      .get<AnalyticsSummary>(`${this.apiUrl}/admin/analytics/overview`, {
        params: { days: days.toString() },
      })
      .pipe(
        catchError(() =>
          of({
            configured: false,
            summary: {
              active_users: 0,
              sessions: 0,
              page_views: 0,
              avg_duration_seconds: 0,
              bounce_rate: 0,
            },
          })
        )
      );
  }

  getRealtime(): Observable<RealtimeAnalytics> {
    return this.http
      .get<RealtimeAnalytics>(`${this.apiUrl}/admin/analytics/realtime`)
      .pipe(
        catchError(() =>
          of({
            configured: false,
            active_users_now: 0,
            top_active_pages: [],
          })
        )
      );
  }

  getTopContent(limit: number = 10, days: number = 30): Observable<TopContentItem[]> {
    return this.http
      .get<TopContentItem[]>(`${this.apiUrl}/admin/analytics/top-content`, {
        params: { limit: limit.toString(), days: days.toString() },
      })
      .pipe(catchError(() => of([])));
  }

  getTrafficSources(days: number = 30): Observable<TrafficSourceItem[]> {
    return this.http
      .get<TrafficSourceItem[]>(`${this.apiUrl}/admin/analytics/traffic-sources`, {
        params: { days: days.toString() },
      })
      .pipe(catchError(() => of([])));
  }
}
