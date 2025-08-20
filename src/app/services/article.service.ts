import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ArticleService {

  private articlesUrl = 'assets/articles.json';

  constructor(private http: HttpClient) { }

  getArticles(): Observable<any[]> {
    return this.http.get<any[]>(this.articlesUrl);
  }

  getLatestArticle(): Observable<any> {
    return this.getArticles().pipe(
      map(articles => articles[0])
    );
  }

  getArticleById(id: string): Observable<any> {
    return this.getArticles().pipe(
      map(articles => articles.find(article => article.id === id))
    );
  }
}
