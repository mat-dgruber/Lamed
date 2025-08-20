import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ArticleService } from '../services/article.service';
import { Observable, combineLatest } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-artigos',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './artigos.html',
  styleUrls: ['./artigos.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Artigos implements OnInit {
  articles$!: Observable<any[]>;
  filteredArticles$!: Observable<any[]>;
  latestArticle$!: Observable<any>;
  searchControl = new FormControl('');

  constructor(private articleService: ArticleService) { }

  ngOnInit(): void {
    this.articles$ = this.articleService.getArticles();
    this.latestArticle$ = this.articleService.getLatestArticle();

    this.filteredArticles$ = combineLatest([
      this.articles$,
      this.searchControl.valueChanges.pipe(startWith(''))
    ]).pipe(
      map(([articles, searchTerm]) => {
        const lowerCaseSearchTerm = searchTerm?.toLowerCase() ?? '';
        return articles.filter(article =>
          article.title.toLowerCase().includes(lowerCaseSearchTerm) ||
          article.description.toLowerCase().includes(lowerCaseSearchTerm) ||
          article.author.toLowerCase().includes(lowerCaseSearchTerm) ||
          (article.tags && article.tags.join(' ').toLowerCase().includes(lowerCaseSearchTerm))
        );
      })
    );
  }
}
