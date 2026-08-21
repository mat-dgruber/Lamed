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
   * Adapts the Video collection data to the structure expected by the video gallery UI.
   * Supports filtering by Shorts (isShort = true) or long videos (isShort = false).
   */
  getVideos(isShort: boolean = false): Observable<AdaptedVideo[]> {
    return this.videoService.getVideos(50, undefined, true, isShort).pipe(
      map(videos =>
        videos
          .filter(videos => {
            const url = (videos.url || '').toLowerCase();
            const title = (videos.title || '').toLowerCase();
            const desc = (videos.description || '').toLowerCase();
            const textIsShort =
              url.includes('/shorts/') ||
              title.includes('#shorts') ||
              desc.includes('#shorts') ||
              title.includes('#reels') ||
              desc.includes('#reels') ||
              title.includes('#corte') ||
              desc.includes('#cortes');
            const detectedIsShort = Boolean(videos.is_short) || textIsShort;
            return detectedIsShort === isShort;
          })
          .map(video => this.adaptVideo(video))
          .slice(0, 20)
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

    // Ensure we extract a valid YouTube ID from URL if videoId is gen_... or missing
    if (!videoId || videoId.startsWith('gen_')) {
      if (url.includes('v=')) {
        videoId = url.split('v=')[1].split('&')[0];
      } else if (url.includes('be/')) {
        videoId = url.split('be/')[1].split('?')[0];
      } else if (url.includes('shorts/')) {
        videoId = url.split('shorts/')[1].split('?')[0].split('/')[0];
      }
    }

    let pubAt: Date | undefined;
    if (video.published_at) {
      pubAt = new Date(video.published_at);
    }

    let thumbUrl = video.thumbnail_url;
    if (!thumbUrl || thumbUrl.includes('gen_')) {
      if (videoId) {
        thumbUrl = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
      }
    }

    return {
      id: { videoId },
      snippet: {
        title: video.title,
        publishedAt: pubAt,
        description: video.description,
        thumbnails: {
          high: { url: thumbUrl }
        }
      }
    };
  }
}

