import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DomSanitizer, SafeHtml, SafeResourceUrl } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { LucideAngularModule } from 'lucide-angular';
import JSZip from 'jszip';
import { environment } from '../../../environments/environment';
import { BundleService, Bundle } from '../../services/bundle.service';
import { SeoService } from '../../core/services/seo.service';
import { AnalyticsService } from '../../core/services/analytics.service';
import { GoogleDriveImagePipe } from '../../pipes/google-drive-image.pipe';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export interface RelatedVideo {
  url: string;
  videoId: string | null;
  safeEmbedUrl: SafeResourceUrl | null;
  isShort: boolean;
}

@Component({
  selector: 'app-bundle-detail',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './bundle-detail.component.html',
  styleUrl: './bundle-detail.component.scss',
})
export class BundleDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private bundleService = inject(BundleService);
  private sanitizer = inject(DomSanitizer);
  private seoService = inject(SeoService);
  private analyticsService = inject(AnalyticsService);
  private http = inject(HttpClient);
  private destroyRef = inject(DestroyRef);

  bundle = signal<Bundle | null>(null);
  loading = signal<boolean>(true);

  // Usability & Reading Signals
  readingModeActive = signal<boolean>(false);
  zipping = signal<boolean>(false);
  linkCopied = signal<boolean>(false);

  safeVideoUrl: SafeResourceUrl | null = null;
  safeArticleUrl: SafeResourceUrl | null = null;
  safeArticleContent: SafeHtml | null = null;
  relatedVideos = signal<RelatedVideo[]>([]);

  getIcon(type: string): string {
    switch (type) {
      case 'mapa_mental':
        return 'map';
      case 'infografico':
        return 'image';
      case 'slides':
        return 'monitor'; // or 'presentation' if available
      case 'guia':
        return 'book';
      case 'pdf':
        return 'file-text';
      case 'audio':
        return 'headphones';
      case 'video':
        return 'play-circle';
      default:
        return 'file';
    }
  }

  ngOnInit() {
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        const id = params.get('id');
        if (id) {
          this.loadBundle(id);
        }
      });
  }

  loadBundle(id: string) {
    this.loading.set(true);
    this.bundleService.getBundleById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.bundle.set(data);
          if (data.video_id) {
            this.safeVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
              `https://www.youtube.com/embed/${data.video_id}`,
            );
          }
          if (data.article_url) {
            try {
              // Handle both absolute and relative URLs
              // Passing window.location.origin as base allows new URL() to work with relative paths

              let urlStr = data.article_url;
              // DEV HELPER: If running locally, force the iframe to load from localhost too
              // This ensures we see our local changes inside the iframe instead of the deployed production version
              if (
                window.location.hostname === 'localhost' ||
                window.location.hostname === '127.0.0.1'
              ) {
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

          if (data.related_video_urls && data.related_video_urls.length > 0) {
            const processed: RelatedVideo[] = data.related_video_urls.map((vUrl) => {
              const videoId = this.extractYoutubeId(vUrl);
              const isShort = vUrl.includes('/shorts/') || vUrl.includes('shorts=true');
              const safeEmbedUrl = videoId
                ? this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${videoId}`)
                : null;
              return {
                url: vUrl,
                videoId,
                safeEmbedUrl,
                isShort,
              };
            });
            this.relatedVideos.set(processed);
          } else {
            this.relatedVideos.set([]);
          }

          // SEO Update
          this.seoService.updateMetaTags({
            title: data.title,
            description: data.description || 'Confira este material exclusivo no Lamed.',
            image: new GoogleDriveImagePipe().transform(data.thumbnail_url),
            type: 'website', // Bundles are collections
            slug: `/bundle/${data.id}`,
          });

          // VideoObject JSON-LD when bundle has a YouTube video
          if (data.video_id) {
            const thumbImage = new GoogleDriveImagePipe().transform(data.thumbnail_url);
            this.seoService.updateJsonLd({
              id: `bundle-video-${data.id}`,
              data: {
                '@context': 'https://schema.org',
                '@type': 'VideoObject',
                name: data.title,
                description: data.description || 'Estudo bíblico em vídeo no Lamed.',
                thumbnailUrl: thumbImage,
                uploadDate: data.published_at,
                embedUrl: `https://www.youtube.com/embed/${data.video_id}`,
                contentUrl: `https://www.youtube.com/watch?v=${data.video_id}`,
                publisher: {
                  '@type': 'Organization',
                  name: 'Lamed',
                  logo: { '@type': 'ImageObject', url: 'https://lamed148.com.br/assets/Imagens/lamed-logo.png' },
                },
              },
            });
          } else {
            // Empty placeholder so a stale previous bundle's VideoObject isn't served.
            this.seoService.updateJsonLd({
              id: `bundle-video-${data.id}`,
              data: { '@context': 'https://schema.org', '@type': 'WebPage' },
            });
          }

          // Track bundle view
          this.analyticsService.trackEvent('view_bundle', {
            bundle_id: data.id,
            bundle_title: data.title,
          });

          this.loading.set(false);
        },
        error: (err) => {
          console.error('Error fetching bundle:', err);
          this.loading.set(false);
        },
      });
  }

  copyLink() {
    const url = window.location.href;
    navigator.clipboard
      .writeText(url)
      .then(() => {
        this.linkCopied.set(true);
        setTimeout(() => {
          this.linkCopied.set(false);
        }, 2000);
        this.analyticsService.trackEvent('share_copy_link', {
          bundle_id: this.bundle()?.id,
          bundle_title: this.bundle()?.title,
        });
      })
      .catch((err) => {
        console.error('Erro ao copiar link:', err);
      });
  }

  extractYoutubeId(url: string): string | null {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  }



  setReadingMode(active: boolean) {
    this.readingModeActive.set(active);
    if (typeof window !== 'undefined') {
      if (active) {
        document.body.classList.add('overflow-hidden');
      } else {
        document.body.classList.remove('overflow-hidden');
      }
    }
  }

  downloadAllAsZip() {
    const currentBundle = this.bundle();
    if (!currentBundle || !currentBundle.resources || currentBundle.resources.length === 0) return;
    this.zipping.set(true);

    const zip = new JSZip();

    // Add README text file to the ZIP
    const readmeContent = `Estudos Bíblicos - Lamed

Lição: ${currentBundle.title}
Número: ${currentBundle.week_number}
Autor: ${currentBundle.author || 'Lamed'}

Este arquivo compactado contém os materiais de apoio para o seu estudo.
Agradecemos por usar o Lamed para crescer no conhecimento da Bíblia!

---------------------------------------------------------
🌱 SOBRE O LAMED & NOSSO PROPÓSITO
---------------------------------------------------------
O Lamed é uma associação sem fins lucrativos dedicada a compartilhar
o conhecimento bíblico de forma acessível e transformadora. Nosso foco
é produzir conteúdo de qualidade que edifique e transforma vidas.

---------------------------------------------------------
🤝 TRANSPARÊNCIA E DESTINAÇÃO DOS RECURSOS
---------------------------------------------------------
Cada doação recebida é utilizada de forma consciente e auditada:
- 55% dos recursos são direcionados a projetos sociais e missionários.
- 45% permanecem em caixa para o desenvolvimento de novos conteúdos,
  manutenção da plataforma e despesas operacionais.

---------------------------------------------------------
💖 COMO APOIAR O NOSSO MINISTÉRIO
---------------------------------------------------------
Se este material tem abençoado sua vida e você deseja nos apoiar para
que possamos alcançar ainda mais pessoas, veja como ajudar:

1. COMPARTILHE: Espalhe a Palavra compartilhando este estudo!
   Acesse a lição online em: https://lamed148.com.br/bundle/${currentBundle.id}

2. SEJA MEMBRO NO YOUTUBE: Com uma pequena contribuição mensal,
   você nos ajuda a manter a produção semanal ativa. Acesse nosso canal
   e clique em "Seja Membro":
   https://www.youtube.com/channel/UC2PYvVmcJBLt9ymvBpnXO9A/join

3. VALEU DEMAIS!: Faça uma contribuição única no YouTube usando o botão
   "Valeu demais!" abaixo de qualquer um dos nossos vídeos.

Sua generosidade é o que nos move. Obrigado por fazer parte desta missão!`;
    zip.file('LEIA-ME.txt', readmeContent);

    const downloadPromises = currentBundle.resources.map((res) => {
      return fetch(res.url)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Failed to fetch ${res.url}: ${response.statusText}`);
          }
          return response.blob();
        })
        .then((blob) => {
          let extension = 'bin';
          const type = res.type.toLowerCase();
          
          if (type.includes('pdf')) {
            extension = 'pdf';
          } else if (type.includes('audio') || type.includes('mp3')) {
            extension = 'mp3';
          } else if (type.includes('video') || type.includes('mp4')) {
            extension = 'mp4';
          } else if (type.includes('slides') || type.includes('pptx') || type.includes('presentation')) {
            extension = 'pptx';
          } else if (type.includes('infografico') || type.includes('infographic') || type.includes('image')) {
            extension = 'png';
          } else if (type.includes('mapa_mental') || type.includes('map')) {
            extension = 'pdf';
          } else if (type.includes('guia') || type.includes('doc')) {
            extension = 'pdf';
          }
          
          const urlPath = res.url.split('?')[0];
          const lastSegment = urlPath.split('/').pop() || '';
          if (lastSegment.includes('.')) {
            const ext = lastSegment.split('.').pop()?.toLowerCase();
            if (ext && ext.length >= 2 && ext.length <= 4) {
              extension = ext;
            }
          }
          let filename = `${res.title}.${extension}`;
          for (const char of ['/', '\\', '?', '%', '*', ':', '|', '"', '<', '>', ' ']) {
            filename = filename.replaceAll(char, '_');
          }
          zip.file(filename, blob);
        });
    });

    Promise.all(downloadPromises)
      .then(() => {
        return zip.generateAsync({ type: 'blob' });
      })
      .then((zipBlob) => {
        const url = window.URL.createObjectURL(zipBlob);
        const a = document.createElement('a');
        a.href = url;
        const safeTitle = currentBundle.title.replace(/[^a-zA-Z0-9]/g, '_');
        a.download = `${safeTitle}_recursos.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        this.zipping.set(false);

        this.analyticsService.trackEvent('download_all_zip_client', {
          bundle_id: currentBundle.id,
          bundle_title: currentBundle.title,
        });
      })
      .catch((err) => {
        console.warn('Client-side zipping failed, falling back to backend:', err);
        const backendUrl = `${environment.apiUrl}/bundles/${currentBundle.id}/download-zip`;
        window.open(backendUrl, '_blank');
        this.zipping.set(false);

        this.analyticsService.trackEvent('download_all_zip_backend_fallback', {
          bundle_id: currentBundle.id,
          bundle_title: currentBundle.title,
        });
      });
  }

  getShareUrl(platform: string): string {
    const currentBundle = this.bundle();
    if (!currentBundle) return '';
    if (typeof window === 'undefined') return '';
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`Confira o estudo "${currentBundle.title}" no Lamed!`);
    
    switch (platform) {
      case 'whatsapp':
        return `https://api.whatsapp.com/send?text=${text}%20${url}`;
      case 'telegram':
        return `https://t.me/share/url?url=${url}&text=${text}`;
      case 'facebook':
        return `https://www.facebook.com/sharer/sharer.php?u=${url}`;
      default:
        return '';
    }
  }
}
