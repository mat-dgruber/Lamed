import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ArticleService } from '../../../services/article.service';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Component({
  selector: 'app-admin-article-list',
  standalone: true,
  imports: [CommonModule, RouterModule, TableModule, ButtonModule],
  templateUrl: './admin-article-list.component.html',
  styleUrls: ['./admin-article-list.component.css']
})
export class AdminArticleListComponent implements OnInit {
  articleService = inject(ArticleService);
  articles = signal<any[]>([]);
  error = signal<string>('');

  ngOnInit() {
    this.loadArticles();
  }

  loadArticles() {
    this.articleService.getArticles().pipe(
        tap(data => console.log('Articles loaded:', data)),
        catchError(err => {
            console.error('Error loading articles:', err);
            this.error.set('Falha ao conectar ao servidor.');
            return of([]);
        })
    ).subscribe(data => {
        this.articles.set(data);
    });
  }

  deleteArticle(slug: string) {
      if(confirm('Tem certeza que deseja deletar este artigo?')) {
          this.articleService.deleteArticle(slug).subscribe(() => {
              this.loadArticles();
          });
      }
  }
}
