import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Article {
  id: string;
  title: string;
  dateISO: string; // or Date
  displayDate: string;
  link: string;
  contentPath: string;
  bannerImage: string;
  description: string;
  author: string;
  tags: string[];
}

@Injectable({
  providedIn: 'root'
})
export class ArticleService {

  private articlesUrl = 'assets/articles.json';
  private http = inject(HttpClient);

  getArticles(): Observable<Article[]> {
    return this.http.get<Article[]>(this.articlesUrl);
  }

  getLatestArticle(): Observable<Article> {
    return this.getArticles().pipe(
      map(articles => articles[0])
    );
  }

  getArticleById(id: string): Observable<Article | undefined> {
    return this.getArticles().pipe(
      map(articles => articles.find(article => article.id === id))
    );
  }
}
