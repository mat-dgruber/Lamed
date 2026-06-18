import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Article {
  id?: string;
  title: string;
  subtitle?: string;
  summary: string;
  cover_image: string;
  content: string;
  highlights: string[];
  tags: string[];
  published_at?: string;
  updated_at?: string;
  created_at?: string;
  is_active: boolean;
  author: string;
}

@Injectable({
  providedIn: 'root'
})
export class ArticleService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/articles`;

  getArticles(limit: number = 10, startAfterId?: string, onlyActive: boolean = true): Observable<Article[]> {
    const params: any = {
      limit: limit.toString(),
      only_active: onlyActive.toString()
    };
    if (startAfterId) {
      params.start_after_id = startAfterId;
    }
    return this.http.get<Article[]>(`${this.apiUrl}/`, { params });
  }

  getArticle(id: string): Observable<Article> {
    return this.http.get<Article>(`${this.apiUrl}/${id}`);
  }
  
  // Alias for compatibility
  getArticleById(id: string): Observable<Article> {
    return this.getArticle(id);
  }

  createArticle(article: Article): Observable<Article> {
    return this.http.post<Article>(`${this.apiUrl}/`, article);
  }

  updateArticle(id: string, article: Article): Observable<Article> {
    return this.http.put<Article>(`${this.apiUrl}/${id}`, article);
  }

  deleteArticle(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
