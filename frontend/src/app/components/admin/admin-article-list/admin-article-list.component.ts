import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ArticleService } from '../../../services/article.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-admin-article-list',
  standalone: true,
  imports: [CommonModule, RouterModule, TableModule, ButtonModule],
  template: `
    <div class="card">
        <div class="flex justify-content-between align-items-center mb-4">
            <h1>Gerenciar Artigos</h1>
            <button pButton label="Novo Artigo" icon="pi pi-plus" routerLink="new"></button>
        </div>
        
        <p-table [value]="articles$ | async" [tableStyle]="{ 'min-width': '50rem' }">
            <ng-template pTemplate="header">
                <tr>
                    <th>Título</th>
                    <th>Data Publicação</th>
                    <th>Status</th>
                    <th>Ações</th>
                </tr>
            </ng-template>
            <ng-template pTemplate="body" let-article>
                <tr>
                    <td>{{ article.title }}</td>
                    <td>{{ article.published_date | date }}</td>
                    <td>
                        <span [class]="'status-badge ' + (article.published ? 'published' : 'draft')">
                            {{ article.published ? 'Publicado' : 'Rascunho' }}
                        </span>
                    </td>
                    <td>
                        <button pButton icon="pi pi-pencil" class="p-button-text" [routerLink]="[article.slug]"></button>
                        <button pButton icon="pi pi-trash" class="p-button-text p-button-danger" (click)="deleteArticle(article.slug)"></button>
                    </td>
                </tr>
            </ng-template>
        </p-table>
    </div>
  `,
  styles: [`
    .status-badge {
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-size: 0.875rem;
    }
    .published {
        background: #e6fffa;
        color: #047857;
    }
    .draft {
        background: #fff5f5;
        color: #c53030;
    }
    .flex { display: flex; }
    .justify-content-between { justify-content: space-between; }
    .align-items-center { align-items: center; }
    .mb-4 { margin-bottom: 1rem; }
  `]
})
export class AdminArticleListComponent implements OnInit {
  articleService = inject(ArticleService);
  articles$: Observable<any[]> | undefined;

  ngOnInit() {
    this.loadArticles();
  }

  loadArticles() {
    this.articles$ = this.articleService.getArticles();
  }

  deleteArticle(slug: string) {
      if(confirm('Tem certeza que deseja deletar este artigo?')) {
          this.articleService.deleteArticle(slug).subscribe(() => {
              this.loadArticles();
          });
      }
  }
}
