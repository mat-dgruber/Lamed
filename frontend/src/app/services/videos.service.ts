import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { VideoService, Video } from './video.service';

export interface AdaptedVideo {
  id: {
    videoId: string;
  };
  snippet: {
    title: string;
    publishedAt?: Date;
    description?: string;
    thumbnails: {
      high: {
        url?: string;
      };
    };
  };
}

@Injectable({
  providedIn: 'root',
})
export class VideosService {
  private videoService = inject(VideoService);

  /**
   * Adapts the new Video collection data to the structure expected by the video gallery UI.
   * Filters out YouTube Shorts and limits to the latest 13 long videos.
   */
  getVideos(): Observable<AdaptedVideo[]> {
    return this.videoService.getVideos(50, undefined, true).pipe(
      map(videos =>
        videos
          .filter(v => {
            const url = (v.url || '').toLowerCase();
            const title = (v.title || '').toLowerCase();
            const desc = (v.description || '').toLowerCase();
            const isShort = url.includes('/shorts/') || title.includes('#shorts') || desc.includes('#shorts');
            return !isShort;
          })
          .map(video => this.adaptVideo(video))
          .slice(0, 13)
      )
    );
  }

  getLatestVideo(): Observable<AdaptedVideo | null> {
    return this.getVideos().pipe(
      map(videos => videos && videos.length > 0 ? videos[0] : null)
    );
  }

  private adaptVideo(video: Video): AdaptedVideo {
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

    let pubAt: Date | undefined;
    if (video.published_at) {
      pubAt = new Date(video.published_at);
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
  }
}

