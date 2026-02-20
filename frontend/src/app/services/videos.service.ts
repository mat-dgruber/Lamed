import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { VideoService } from './video.service';

@Injectable({
  providedIn: 'root'
})
export class VideosService {
  private videoService = inject(VideoService);

  /**
   * Adapts the new Video collection data to the structure expected by the video gallery UI.
   */
  getVideos(): Observable<any[]> {
    return this.videoService.getVideos().pipe(
      map(videos => videos.map(video => {
        let videoId = video.id;
        const url = video.url || '';
        
        // Ensure we have a valid YouTube ID for the player
        if (videoId.startsWith('gen_') || !videoId) {
           if (url.includes('v=')) {
            videoId = url.split('v=')[1].split('&')[0];
          } else if (url.includes('be/')) {
            videoId = url.split('be/')[1].split('?')[0];
          }
        }

        let pubAt = video.published_at;
        if (pubAt && typeof pubAt.toDate === 'function') {
          pubAt = pubAt.toDate();
        } else if (typeof pubAt === 'string') {
          pubAt = new Date(pubAt);
        }

        return {
          id: { videoId },
          snippet: {
            title: video.title,
            publishedAt: pubAt,
            description: video.description,
            thumbnails: {
              high: { url: video.thumbnail_url }
            }
          }
        };
      }))
    );
  }

  getLatestVideo(): Observable<any> {
    return this.getVideos().pipe(
      map(videos => videos && videos.length > 0 ? videos[0] : null)
    );
  }
}
