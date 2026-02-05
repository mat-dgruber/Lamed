import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Firestore, collection, collectionData, query, where, orderBy } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class VideosService {
  private firestore = inject(Firestore);

  getVideos(): Observable<any[]> {
    const bundlesRef = collection(this.firestore, 'bundles');
    // Querying for bundles that have video data and are active
    // Note: Since we want to show all videos, we check for existence of video_data
    // If you want to show only active ones:
    const q = query(
      bundlesRef, 
      where('video_data', '!=', null),
      orderBy('video_data'), // Needed for inequality filter in Firestore
      orderBy('published_at', 'desc')
    );

    return collectionData(q, { idField: 'id' }).pipe(
      map((bundles: any[]) => bundles.map(bundle => {
        // Extract videoId from URL if possible
        let videoId = '';
        const url = bundle.video_data?.url || '';
        if (url.includes('v=')) {
          videoId = url.split('v=')[1].split('&')[0];
        } else if (url.includes('be/')) {
          videoId = url.split('be/')[1].split('?')[0];
        }

        return {
          id: { videoId },
          snippet: {
            title: bundle.title,
            publishedAt: bundle.published_at?.toDate?.() || bundle.published_at,
            description: bundle.description,
            thumbnails: {
              high: { url: bundle.thumbnail_url }
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
