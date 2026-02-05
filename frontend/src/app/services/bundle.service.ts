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
  type: 'pdf' | 'pptx' | 'infographic' | 'doc' | 'csv' | 'audio' | 'image' | 'video';
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
  article_url?: string;
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

  getBundles(limit: number = 10, offset: number = 0, only_active: boolean = true): Observable<Bundle[]> {
    return this.http.get<Bundle[]>(`${this.apiUrl}/bundles`, {
      params: { limit, offset, only_active }
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

  syncVideosFromAssets(): Observable<any> {
    return this.http.get<any[]>('assets/videos.json').pipe(
      map(videos => {
        const existingVideoIds = new Set(
          this.bundles().map(b => {
             // Extract ID from URL like https://youtube.com/watch?v=ID or https://youtu.be/ID
             const url = b.video_data?.url || '';
             if (url.includes('v=')) return url.split('v=')[1].split('&')[0];
             if (url.includes('youtu.be/')) return url.split('youtu.be/')[1].split('?')[0];
             return '';
          })
        );
        
        return videos.filter(v => {
          const videoId = v.id.videoId;
          return videoId && !existingVideoIds.has(videoId);
        });
      }),
      tap(newVideos => console.log(`Found ${newVideos.length} new videos to sync.`)),
      switchMap(newVideos => {
        if (newVideos.length === 0) return of([]);

        const creationRequests = newVideos.map(video => {
          const draftBundle: Omit<Bundle, 'id' | 'created_at' | 'updated_at'> = {
            title: video.snippet.title,
            description: video.snippet.description || '',
            week_number: 0,
            author: 'Lamed',
            published_at: video.snippet.publishedAt,
            video_data: {
              url: `https://www.youtube.com/watch?v=${video.id.videoId}`,
              provider: 'youtube',
              duration: 0
            },
            thumbnail_url: video.snippet.thumbnails?.high?.url || video.snippet.thumbnails?.medium?.url,
            resources: [],
            is_active: false
          };
          // Request creation but ignore errors to continue others
          return this.createBundle(draftBundle).pipe(catchError(e => of(null))); 
        });

        return forkJoin(creationRequests);
      }),
      tap(() => {
        // Refresh bundles after sync
        this.getBundles(50, 0).subscribe();
      })
    );
  }
}
