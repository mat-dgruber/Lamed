import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface VideoData {
  url: string;
  provider: 'youtube' | 'storage';
  duration?: number;
}

export interface Resource {
  title: string;
  type: 'pdf' | 'pptx' | 'infographic' | 'doc' | 'csv' | 'audio' | 'image';
  url: string;
}

export interface Bundle {
  id: string;
  title: string;
  description: string;
  week_number: number;
  author?: string;
  published_at?: string; // ISO String
  video_data?: VideoData;
  thumbnail_url?: string;
  article_content?: string;
  resources: Resource[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class BundleService {
  private http = inject(HttpClient);
  // Allow switching environment URL or defaulting to local for dev
  private apiUrl = environment.apiUrl || 'http://localhost:8000'; // Fallback if env not set

  // Signals for reactive state
  bundles = signal<Bundle[]>([]);

  getBundles(limit: number = 10, offset: number = 0): Observable<Bundle[]> {
    return this.http.get<Bundle[]>(`${this.apiUrl}/bundles`, {
      params: { limit, offset }
    }).pipe(
      tap(data => this.bundles.set(data)),
      catchError(err => {
        console.error('Error fetching bundles', err);
        return of([]);
      })
    );
  }

  getLatestBundle(): Observable<Bundle | null> {
    return this.http.get<Bundle>(`${this.apiUrl}/bundles/latest`).pipe(
      catchError(() => of(null))
    );
  }

  getBundleById(id: string): Observable<Bundle> {
    return this.http.get<Bundle>(`${this.apiUrl}/bundles/${id}`);
  }

  createBundle(bundle: Omit<Bundle, 'id' | 'created_at' | 'updated_at'>): Observable<Bundle> {
    return this.http.post<Bundle>(`${this.apiUrl}/bundles`, bundle);
  }

  updateBundle(id: string, bundle: Partial<Bundle>): Observable<Bundle> {
    return this.http.put<Bundle>(`${this.apiUrl}/bundles/${id}`, bundle);
  }
}
