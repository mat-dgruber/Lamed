import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Observable, switchMap, of } from 'rxjs';
import { Article, ArticlesService } from '../../services/articles.service';

@Component({
  selector: 'app-article-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div *ngIf="article; else loadingOrError">
      <header class="article-header">
        <div class="article-banner-image">
          <!-- O caminho da imagem precisa ser ajustado para o contexto dos assets do Angular -->
          <img [src]="'assets/' + article.bannerImage" [alt]="article.title" id="article-banner">
        </div>
        <h1 id="article-title">{{ article.title }}</h1>
        <p class="article-meta">Escrito por: <span id="article-author">{{ article.author }}</span></p>
        <p class="article-meta">Publicado em: <time [attr.datetime]="article.dateISO">{{ article.displayDate }}</time></p>
      </header>
      
      <!-- Usamos [innerHTML] para renderizar o conteúdo HTML do artigo.
           Isso é seguro aqui porque o conteúdo vem de nossos próprios arquivos. -->
      <div class="article-content" [innerHTML]="articleContent$ | async"></div>
    </div>

    <ng-template #loadingOrError>
        <div *ngIf="errorMessage; else loading">
            <p>{{ errorMessage }}</p>
            <a routerLink="/artigos">Voltar para a lista de artigos</a>
        </div>
        <ng-template #loading>
            <p>Carregando artigo...</p>
        </ng-template>
    </ng-template>
  `
})
export class ArticleDetailComponent implements OnInit {
  article: Article | undefined;
  articleContent$!: Observable<string | null>;
  errorMessage: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private articlesService: ArticlesService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.pipe(
      switchMap(params => {
        const id = params.get('id');
        if (!id) {
          this.errorMessage = 'Artigo não encontrado. ID não fornecido.';
          return of(null);
        }
        return this.articlesService.getArticleById(id);
      })
    ).subscribe(article => {
      if (article) {
        this.article = article;
        this.articleContent$ = this.articlesService.getArticleContent(article.contentPath);
      } else {
        this.errorMessage = 'O artigo que você está procurando não foi encontrado.';
      }
    });
  }
}
