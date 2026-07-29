import { Component, OnInit, inject, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink, Params, ParamMap } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { LucideAngularModule } from 'lucide-angular';
import { ArticleService, Article } from '../../services/article.service';
import { Timestamp } from '@angular/fire/firestore';
import { SeoService } from '../../core/services/seo.service';
import { AnalyticsService } from '../../core/services/analytics.service';
import { GoogleDriveImagePipe, convertGoogleDriveUrl } from '../../pipes/google-drive-image.pipe';

@Component({
  selector: 'app-article-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule, GoogleDriveImagePipe],
  templateUrl: './article-detail.component.html',
  styleUrl: './article-detail.component.scss'
})
export class ArticleDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private articleService = inject(ArticleService);
  private sanitizer = inject(DomSanitizer);
  private seoService = inject(SeoService);
  private analyticsService = inject(AnalyticsService);

  article = signal<Article | undefined>(undefined);
  loading = signal<boolean>(true);
  safeContent: SafeHtml | null = null;
  isButtonVisible = signal(false);
  isEmbedded = signal(false);

  onWindowScroll() {
    this.isButtonVisible.set(window.scrollY > 200);
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/Imagens/Fundo_Lamed-total.png';
  }

  ngOnInit() {
    // Check for embedded mode
    this.route.queryParams.subscribe((params: Params) => {
        this.isEmbedded.set(params['embedded'] === 'true');
    });

    this.route.paramMap.subscribe((params: ParamMap) => {
      const id = params.get('id');
      if (id) {
        this.loadArticle(id);
      }
    });
  }

  loadArticle(id: string) {
    this.loading.set(true);
    this.articleService.getArticleById(id).subscribe({
      next: (data: Article) => {
        this.article.set(data);
        if (data?.content) {
          const processedHtml = this.processDriveImagesInHtml(data.content);
          this.safeContent = this.sanitizer.bypassSecurityTrustHtml(processedHtml);
        }
        
        // SEO Update
        if (data) {
          const summary = data.content ? data.content.substring(0, 150).replace(/<[^>]*>/g, '') + '...' : 'Leia este artigo completo no Lamed.';
          
          this.seoService.updateMetaTags({
            title: data.title,
            description: summary,
            image: data.cover_image,
            type: 'article',
            author: data.author,
            slug: `/article/${data.id}`
          });

          this.seoService.updateJsonLd({
            id: `article-${data.id}`,
            data: {
              '@context': 'https://schema.org',
              '@type': 'Article',
              headline: data.title,
              description: summary,
              image: data.cover_image,
              author: { '@type': 'Person', name: data.author || 'Lamed' },
              publisher: {
                '@type': 'Organization',
                name: 'Lamed',
                logo: { '@type': 'ImageObject', url: 'https://lamed148.com.br/assets/Imagens/lamed-logo.png' },
              },
              mainEntityOfPage: {
                '@type': 'WebPage',
                '@id': `https://lamed148.com.br/article/${data.id}`,
              },
              datePublished: data.published_at,
              dateModified: data.updated_at || data.published_at,
            },
          });

          // Track specific article view
          this.analyticsService.trackEvent('view_article', {
            article_id: data.id,
            article_title: data.title
          });
        }

        this.loading.set(false);
      },
      error: (err: any) => {
        console.error(err);
        this.loading.set(false);
      }
    });
  }

  toDate(timestamp: any): Date | null {
    if (!timestamp) return null;
    // Firebase Timestamp has toDate()
    if (timestamp instanceof Timestamp) {
      return timestamp.toDate();
    }
    // If it's already a date or string (fallback)
    return new Date(timestamp);
  }

  private processDriveImagesInHtml(html: string): string {
    return html.replace(/src=["'](https?:\/\/[^"']+)["']/gi, (match, url) => {
      if (url.includes('drive.google.com')) {
        const converted = convertGoogleDriveUrl(url);
        return `src="${converted}"`;
      }
      return match;
    });
  }
}

