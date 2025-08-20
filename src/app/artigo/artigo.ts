import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ArticleService } from '../services/article.service';
import { Observable, of } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';

@Component({
  selector: 'app-artigo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './artigo.html',
  styleUrls: [],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Artigo implements OnInit {
  article$!: Observable<any>;
  articleContent$!: Observable<SafeHtml>;

  constructor(
    private route: ActivatedRoute,
    private articleService: ArticleService,
    private http: HttpClient,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this.article$ = this.route.paramMap.pipe(
      switchMap(params => {
        const id = params.get('id');
        if (id) {
          return this.articleService.getArticleById(id);
        }
        return of(null);
      })
    );

    this.articleContent$ = this.article$.pipe(
      switchMap(article => {
        if (article && article.contentPath) {
          // Assuming contentPath is now the full path from the assets root
          return this.http.get(article.contentPath, { responseType: 'text' });
        }
        return of('');
      }),
      map(htmlContent => {
        if (htmlContent) {
          const parser = new DOMParser();
          const doc = parser.parseFromString(htmlContent, 'text/html');
          const articleContent = doc.querySelector('div.article-content');
          return articleContent ? articleContent.innerHTML : 'Conteúdo do artigo não encontrado.';
        }
        return 'Artigo não encontrado.';
      }),
      map(htmlContent => this.sanitizer.bypassSecurityTrustHtml(htmlContent))
    );
  }
}
