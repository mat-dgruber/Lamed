import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ArticleService } from '../../services/article.service';
import { Observable, combineLatest } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MetaTagService } from '../../services/meta-tag.service';

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

  constructor(
    private articleService: ArticleService,
    private metaTagService: MetaTagService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.metaTagService.updateTags(
      'Artigos',
      'Leia nossos artigos aprofundados sobre a Lição da Escola Sabatina, teologia e vida cristã para jovens.',
      'assets/Imagens/Fundo_Lamed-total.png',
      this.router.url
    );

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
