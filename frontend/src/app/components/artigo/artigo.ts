import { Component, OnInit, ChangeDetectionStrategy, HostListener, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ArticleService } from '../../services/article.service';
import { Observable, of } from 'rxjs';
import { switchMap, map, tap } from 'rxjs/operators';
import { MetaTagService } from '../../services/meta-tag.service';

@Component({
  selector: 'app-artigo',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './artigo.html',
  styleUrls: ['./artigo.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Artigo implements OnInit {
  article$!: Observable<any>;
  articleContent$!: Observable<SafeHtml>;
  isButtonVisible = false;

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const shouldBeVisible = window.scrollY > 200;
    if (shouldBeVisible !== this.isButtonVisible) {
      this.isButtonVisible = shouldBeVisible;
      this.cdr.markForCheck();
    }
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private articleService: ArticleService,
    private http: HttpClient,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef,
    private metaTagService: MetaTagService
  ) { }

  ngOnInit(): void {
    this.article$ = this.route.paramMap.pipe(
      switchMap(params => {
        const id = params.get('id');
        if (id) {
          return this.articleService.getArticleById(id);
        }
        return of(null);
      }),
      tap(article => {
        if (article) {
          this.metaTagService.updateTags(
            article.title,
            article.description,
            article.bannerImage,
            this.router.url
          );
        }
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
          const mainContent = doc.querySelector('main.site-main');

          if (mainContent) {
            // Correct image paths before returning the content
            const images = mainContent.querySelectorAll('img');
            images.forEach(img => {
              const src = img.getAttribute('src');
              if (src && src.startsWith('../')) {
                // The static files are in assets/Artigos, images in assets/Imagens.
                // The path from an article is ../Imagens/foo.png.
                // When injecting into angular, the base is the app root.
                // The path needs to become assets/Imagens/foo.png
                img.src = 'assets/' + src.substring(3);
              }
            });
            return mainContent.innerHTML;
          }
          return htmlContent; // Fallback
        }
        return 'Artigo não encontrado.';
      }),
      map(htmlContent => this.sanitizer.bypassSecurityTrustHtml(htmlContent))
    );
  }
}
