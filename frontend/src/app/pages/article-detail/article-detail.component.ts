import { Component, OnInit, inject, signal, computed, HostListener } from '@angular/core';
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
  styleUrl: './article-detail.component.scss',
})
export class ArticleDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private articleService = inject(ArticleService);
  private sanitizer = inject(DomSanitizer);
  private seoService = inject(SeoService);
  private analyticsService = inject(AnalyticsService);

  article = signal<Article | undefined>(undefined);
  relatedArticles = signal<Article[]>([]);
  loading = signal<boolean>(true);
  safeContent: SafeHtml | null = null;
  isEmbedded = signal(false);
  readingProgress = signal<number>(0);
  shareCopied = signal(false);

  readingTime = computed(() => {
    const art = this.article();
    if (!art) return 1;
    const text = `${art.title || ''} ${art.summary || ''} ${art.content || ''}`;
    const words = text.replace(/<[^>]*>/g, ' ').trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(words / 180));
  });

  @HostListener('window:scroll')
  onWindowScroll() {
    if (typeof window === 'undefined') return;
    const scrollY = window.scrollY || document.documentElement.scrollTop;

    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight > 0) {
      const progress = Math.min(100, Math.max(0, (scrollY / docHeight) * 100));
      this.readingProgress.set(Math.round(progress));
    }
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/Imagens/Fundo_Lamed-total.png';
  }

  ngOnInit() {
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
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    this.articleService.getArticleById(id).subscribe({
      next: (data: Article) => {
        this.article.set(data);
        if (data?.content) {
          const processedHtml = this.processDriveImagesInHtml(data.content);
          this.safeContent = this.sanitizer.bypassSecurityTrustHtml(processedHtml);
        }

        // SEO Update
        if (data) {
          const summary = data.content
            ? data.content.substring(0, 150).replace(/<[^>]*>/g, '') + '...'
            : 'Leia este artigo completo no Lamed.';

          this.seoService.updateMetaTags({
            title: data.title,
            description: summary,
            image: data.cover_image,
            type: 'article',
            author: data.author,
            slug: `/article/${data.id}`,
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
                logo: {
                  '@type': 'ImageObject',
                  url: 'https://lamed148.com.br/assets/Imagens/lamed-logo.png',
                },
              },
              mainEntityOfPage: {
                '@type': 'WebPage',
                '@id': `https://lamed148.com.br/article/${data.id}`,
              },
              datePublished: data.published_at,
              dateModified: data.updated_at || data.published_at,
            },
          });

          this.analyticsService.trackEvent('view_article', {
            article_id: data.id,
            article_title: data.title,
          });
        }

        // Carrega artigos relacionados / recentes para o final da página (Peak-End Rule)
        this.loadRelatedArticles(id);

        this.loading.set(false);
      },
      error: (err: any) => {
        console.error('Erro ao carregar artigo:', err);
        this.loading.set(false);
      },
    });
  }

  private loadRelatedArticles(currentId: string) {
    this.articleService.getArticles(4).subscribe({
      next: (articles) => {
        const others = (articles || []).filter((a) => a.id !== currentId).slice(0, 3);
        this.relatedArticles.set(others);
      },
      error: () => {
        // Silently ignore if related articles fail
      },
    });
  }

  async shareArticle() {
    const art = this.article();
    if (!art) return;

    const url =
      typeof window !== 'undefined'
        ? window.location.href
        : `https://lamed148.com.br/article/${art.id}`;
    const shareData = {
      title: art.title,
      text: art.summary || 'Leia este artigo edificante no Lamed',
      url,
    };

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      this.shareCopied.set(true);
      setTimeout(() => this.shareCopied.set(false), 3000);
    } catch {
      // Graceful fallback
    }
  }

  shareWhatsApp() {
    const art = this.article();
    if (!art || typeof window === 'undefined') return;
    const url = window.location.href;
    const text = encodeURIComponent(
      `*${art.title}*\n${art.summary || ''}\n\nLeia completo no Lamed: ${url}`,
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  }

  toDate(timestamp: any): Date | null {
    if (!timestamp) return null;
    if (timestamp instanceof Timestamp) {
      return timestamp.toDate();
    }
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
