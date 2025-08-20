import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class VideoService {

  private videosUrl = 'assets/videos.json';

  constructor(private http: HttpClient) { }

  getVideos(): Observable<any[]> {
    return this.http.get<any[]>(this.videosUrl);
  }

  getLatestVideo(): Observable<any> {
    return this.getVideos().pipe(
      map(videos => videos[0])
    );
  }
}
