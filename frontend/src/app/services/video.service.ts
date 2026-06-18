import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Video {
  id: string;
  title: string;
  description?: string;
  url: string;
  provider: 'youtube' | 'storage';
  thumbnail_url?: string;
  published_at?: string; // ISO String from backend API
  is_active: boolean;
  author: string;
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root',
})
export class VideoService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/videos`;

  getVideos(
    limit: number = 50,
    startAfterId?: string,
    onlyActive: boolean = true,
  ): Observable<Video[]> {
    const params: any = { limit, only_active: onlyActive };
    if (startAfterId) {
      params.start_after_id = startAfterId;
    }
    return this.http.get<Video[]>(`${this.apiUrl}/`, { params }).pipe(
      catchError((err) => {
        console.error('Error fetching videos:', err);
        return of([]);
      }),
    );
  }

  getVideoById(id: string): Observable<Video | null> {
    return this.http.get<Video>(`${this.apiUrl}/${id}`).pipe(
      catchError((err) => {
        console.error(`Error fetching video with ID ${id}:`, err);
        return of(null);
      }),
    );
  }
}

