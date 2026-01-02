import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ArticleService {

  private apiUrl = '/api/articles'; // Relative path for Proxy

  constructor(private http: HttpClient) { }

  getArticles(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getLatestArticle(): Observable<any> {
    return this.getArticles().pipe(
      map(articles => articles[0])
    );
  }

  getArticleById(slug: string): Observable<any> {
     // API supports get by slug directly
    return this.http.get<any>(`${this.apiUrl}/${slug}`);
  }

  // New Methods
  deleteArticle(slug: string): Observable<any> {
      return this.http.delete(`${this.apiUrl}/${slug}`);
  }
  
  createArticle(article: any): Observable<any> {
      return this.http.post(this.apiUrl, article);
  }

  updateArticle(slug: string, article: any): Observable<any> {
      return this.http.put(`${this.apiUrl}/${slug}`, article);
  }
}
