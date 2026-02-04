import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class VideosService {
  private http = inject(HttpClient);
  // Pointing to the restored asset file
  private videosUrl = 'assets/videos.json';

  getVideos(): Observable<any[]> {
    return this.http.get<any[]>(this.videosUrl);
  }

  getLatestVideo(): Observable<any> {
    return this.getVideos().pipe(
      map(videos => videos && videos.length > 0 ? videos[0] : null)
    );
  }
}
