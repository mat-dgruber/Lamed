import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Article, ArticlesService } from '../../services/articles.service';

@Component({
  selector: 'app-articles-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="search-container">
      <input
        type="text"
        id="search-input"
        placeholder="Buscar por título, autor, ou palavra-chave..."
        [(ngModel)]="searchTerm"
        (input)="filterArticles()"
        aria-label="Buscar Artigos"
      />
    </div>

    <ul id="articles-list-ul" class="articles-list">
      <li *ngIf="filteredArticles.length === 0 && !isLoading">
        Nenhum artigo encontrado.
      </li>
      <li *ngFor="let article of filteredArticles">
        <!-- O link deve usar o routerLink do Angular para navegar para a página de detalhes -->
        <!-- A rota '/artigos' precisa ser configurada no seu app-routing.module.ts -->
        <a [routerLink]="['/artigos', article.id]">
          <strong>{{ article.title }}</strong>
          <span class="article-list-item-meta">
            Por: {{ article.author }} - Publicado em: {{ article.displayDate }}
          </span>
        </a>
      </li>
    </ul>
    <div *ngIf="isLoading" class="loading-indicator">
        Carregando artigos...
    </div>
  `
})
export class ArticlesListComponent implements OnInit {
  allArticles: Article[] = [];
  filteredArticles: Article[] = [];
  searchTerm: string = '';
  isLoading: boolean = true;

  constructor(private articlesService: ArticlesService) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.articlesService.getArticles().subscribe({
      next: (articles) => {
        this.allArticles = articles;
        this.filteredArticles = articles;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar artigos:', err);
        this.isLoading = false;
      }
    });
  }

  filterArticles(): void {
    if (!this.searchTerm) {
      this.filteredArticles = [...this.allArticles];
      return;
    }

    const lowerCaseSearchTerm = this.searchTerm.toLowerCase().trim();

    this.filteredArticles = this.allArticles.filter(article => {
      const searchIn = `
        ${article.title} 
        ${article.description} 
        ${article.author} 
        ${article.tags ? article.tags.join(' ') : ''}
      `.toLowerCase();
      
      return searchIn.includes(lowerCaseSearchTerm);
    });
  }
}
