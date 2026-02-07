import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DomSanitizer, SafeHtml, SafeResourceUrl } from '@angular/platform-browser';
import { LucideAngularModule } from 'lucide-angular';
import { BundleService, Bundle } from '../../services/bundle.service';
import { SeoService } from '../../core/services/seo.service';
import { AnalyticsService } from '../../core/services/analytics.service';
import { GoogleDriveImagePipe } from '../../pipes/google-drive-image.pipe';

@Component({
  selector: 'app-bundle-detail',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './bundle-detail.component.html',
  styleUrl: './bundle-detail.component.scss'
})
export class BundleDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private bundleService = inject(BundleService);
  private sanitizer = inject(DomSanitizer);
  private seoService = inject(SeoService);
  private analyticsService = inject(AnalyticsService);

  bundle = signal<Bundle | null>(null);
  loading = signal<boolean>(true);
  
  safeVideoUrl: SafeResourceUrl | null = null;
  safeArticleUrl: SafeResourceUrl | null = null;
  safeArticleContent: SafeHtml | null = null;

  getIcon(type: string): string {
    switch (type) {
      case 'mapa_mental': return 'map';
      case 'infografico': return 'image';
      case 'slides': return 'monitor'; // or 'presentation' if available
      case 'guia': return 'book';
      case 'pdf': return 'file-text';
      case 'audio': return 'headphones';
      case 'video': return 'play-circle';
      default: return 'file';
    }
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadBundle(id);
      }
    });
  }

  loadBundle(id: string) {
    this.loading.set(true);
    this.bundleService.getBundleById(id).subscribe({
      next: (data) => {
        this.bundle.set(data);
        if (data.video_id) {
           this.safeVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${data.video_id}`);
        }
        if (data.article_url) {
          try {
            // Handle both absolute and relative URLs
            // Passing window.location.origin as base allows new URL() to work with relative paths
            
            let urlStr = data.article_url;
            // DEV HELPER: If running locally, force the iframe to load from localhost too
            // This ensures we see our local changes inside the iframe instead of the deployed production version
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                if (urlStr.includes('lamed148.com.br')) {
                    urlStr = urlStr.replace('https://lamed148.com.br', window.location.origin);
                    urlStr = urlStr.replace('http://lamed148.com.br', window.location.origin); // Handle http just in case
                }
            }

            const url = new URL(urlStr, window.location.origin);
            url.searchParams.set('embedded', 'true');
            // Convert back to string (if it was relative, we might want to keep it relative or absolute, 
            // usually absolute is fine for iframe src)
            const finalUrl = url.toString();
            this.safeArticleUrl = this.sanitizer.bypassSecurityTrustResourceUrl(finalUrl);
          } catch (e) {
            console.warn('Error constructing article URL:', e);
            // Fallback: simple string concatenation if something weird happens, though new URL should cover it
            const separator = data.article_url.includes('?') ? '&' : '?';
            const fallbackUrl = `${data.article_url}${separator}embedded=true`;
            this.safeArticleUrl = this.sanitizer.bypassSecurityTrustResourceUrl(fallbackUrl);
          }
        }
        if (data.article_content) {
          this.safeArticleContent = this.sanitizer.bypassSecurityTrustHtml(data.article_content);
        }

        // SEO Update
        this.seoService.updateMetaTags({
          title: data.title,
          description: data.description || 'Confira este material exclusivo no Lamed.',
          image: new GoogleDriveImagePipe().transform(data.thumbnail_url),
          type: 'website', // Bundles are collections
          slug: `/bundle/${data.id}`
        });

        // Track bundle view
        this.analyticsService.trackEvent('view_bundle', {
          bundle_id: data.id,
          bundle_title: data.title
        });

        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  copyLink() {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      alert('Link copiado com sucesso!');
    }).catch(err => {
      console.error('Erro ao copiar link:', err);
    });
  }

  private extractYoutubeId(url: string): string | null {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  }
}
