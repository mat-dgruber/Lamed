import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { ArticleService, Article } from '../../services/article.service';
import { GoogleDriveImagePipe } from '../../pipes/google-drive-image.pipe';

@Component({
  selector: 'app-article-list',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule, GoogleDriveImagePipe],
  templateUrl: './article-list.component.html',
  styles: []
})
export class ArticleListComponent implements OnInit {
  private articleService = inject(ArticleService);
  articles: Article[] = [];

  ngOnInit() {
    this.loadArticles();
  }

  loadArticles() {
    this.articleService.getArticles(50, undefined, false).subscribe(data => {
      this.articles = data;
    });
  }

  deleteArticle(article: Article) {
    if (confirm(`Tem certeza que deseja excluir "${article.title}"?`)) {
      this.articleService.deleteArticle(article.id!).subscribe(() => {
        this.loadArticles();
      });
    }
  }
}
