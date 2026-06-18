import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, tap, forkJoin, switchMap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface VideoData {
  url: string;
  provider: 'youtube' | 'storage';
  duration?: number;
}

export interface Resource {
  title: string;
  type: 'pdf' | 'pptx' | 'infographic' | 'doc' | 'csv' | 'audio' | 'image' | 'video' | 'mapa_mental' | 'slides' | 'guia' | 'infografico';
  url: string;
}

export interface Bundle {
  id: string;
  title: string;
  description: string;
  week_number: number;
  author?: string;
  published_at?: string; // ISO String
  video_id?: string;
  thumbnail_url?: string;
  article_content?: string;
  article_url?: string;
  resources: Resource[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

@Injectable({
  providedIn: 'root',
})
export class BundleService {
  private http = inject(HttpClient);
  // Allow switching environment URL or defaulting to local for dev
  private apiUrl = environment.apiUrl;

  // Signals for reactive state
  bundles = signal<Bundle[] | undefined>(undefined);

  getBundles(
    limit: number = 10,
    startAfterId?: string,
    only_active: boolean = true,
  ): Observable<Bundle[]> {
    const params: any = { limit, only_active };
    if (startAfterId) {
      params.start_after_id = startAfterId;
    }
    return this.http
      .get<Bundle[]>(`${this.apiUrl}/bundles/`, { params })
      .pipe(
        tap((data) => this.bundles.set(data)),
        catchError((err) => {
          console.error('Error fetching bundles', err);
          return of([]);
        }),
      );
  }

  getLatestBundle(): Observable<Bundle | null> {
    return this.http.get<Bundle>(`${this.apiUrl}/bundles/latest`).pipe(catchError(() => of(null)));
  }

  getBundleById(id: string): Observable<Bundle> {
    return this.http.get<Bundle>(`${this.apiUrl}/bundles/${id}`);
  }

  createBundle(bundle: Omit<Bundle, 'id' | 'created_at' | 'updated_at'>): Observable<Bundle> {
    return this.http.post<Bundle>(`${this.apiUrl}/bundles/`, bundle);
  }

  updateBundle(id: string, bundle: Partial<Bundle>): Observable<Bundle> {
    return this.http.put<Bundle>(`${this.apiUrl}/bundles/${id}`, bundle);
  }

  deleteBundle(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/bundles/${id}`);
  }

  syncWithYouTube(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/admin/sync-youtube`, {});
  }

  syncVideosFromAssets(): Observable<Bundle[]> {
    return this.http.get<any[]>('assets/videos.json').pipe(
      map((videos) => {
        const existingVideoIds = new Set(
          (this.bundles() || []).map((b) => {
            // Extract ID from URL like https://youtube.com/watch?v=ID or https://youtu.be/ID
            return b.video_id || '';
          }),
        );

        return videos.filter((v) => {
          const videoId = v.id.videoId;
          return videoId && !existingVideoIds.has(videoId);
        });
      }),
      tap((newVideos) => console.log(`Found ${newVideos.length} new videos to sync.`)),
      switchMap((newVideos) => {
        if (newVideos.length === 0) return of([]);

        const creationRequests = newVideos.map((video) => {
          const draftBundle: Omit<Bundle, 'id' | 'created_at' | 'updated_at'> = {
            title: video.snippet.title,
            description: video.snippet.description || '',
            week_number: 0,
            author: 'Lamed',
            published_at: video.snippet.publishedAt,
            video_id: video.id.videoId,
            thumbnail_url:
              video.snippet.thumbnails?.high?.url || video.snippet.thumbnails?.medium?.url,
            resources: [],
            is_active: false,
          };
          // Request creation but ignore errors to continue others
          return this.createBundle(draftBundle).pipe(catchError((e) => of(null)));
        });

        return forkJoin(creationRequests);
      }),
      switchMap(() => {
        // Refresh bundles after sync and return the new list reactively
        return this.getBundles(50, undefined);
      }),
    );
  }
}
