import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, query, orderBy, doc, docData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Video {
  id: string;
  title: string;
  description: string;
  url: string;
  provider: 'youtube' | 'storage';
  thumbnail_url: string;
  published_at: any;
  author: string;
  is_active: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class VideoService {
  private firestore = inject(Firestore);
  private collectionName = 'videos';

  getVideos(): Observable<Video[]> {
    const vRef = collection(this.firestore, this.collectionName);
    const q = query(vRef, orderBy('published_at', 'desc'));
    return collectionData(q, { idField: 'id' }) as Observable<Video[]>;
  }

  getVideoById(id: string): Observable<Video> {
    const vDoc = doc(this.firestore, `${this.collectionName}/${id}`);
    return docData(vDoc, { idField: 'id' }) as Observable<Video>;
  }
}
