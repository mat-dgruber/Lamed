import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, doc, docData, query, orderBy, Timestamp } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Article {
  id: string;
  title: string;
  description: string;
  content: string;
  author: string;
  published_at: Date; // Converted from Timestamp
  banner_image_url: string;
  tags?: string[];
  is_active: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ArticleService {
  private firestore = inject(Firestore);
  private articlesCollection = collection(this.firestore, 'articles');

  getArticles(): Observable<Article[]> {
    const q = query(this.articlesCollection, orderBy('published_at', 'desc'));
    return (collectionData(q, { idField: 'id' }) as Observable<any[]>).pipe(
      map(articles => articles.map(a => this.mapArticle(a)))
    );
  }

  getArticleById(id: string): Observable<Article | undefined> {
    const docRef = doc(this.firestore, `articles/${id}`);
    return (docData(docRef, { idField: 'id' }) as Observable<any>).pipe(
      map(a => a ? this.mapArticle(a) : undefined)
    );
  }

  private mapArticle(data: any): Article {
    return {
      ...data,
      published_at: data.published_at?.toDate ? data.published_at.toDate() : new Date(data.published_at),
    } as Article;
  }
}
