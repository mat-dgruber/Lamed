import { DestroyRef, Inject, Injectable, inject } from '@angular/core';
import { Title, Meta, MetaDefinition } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export interface SeoConfig {
  title: string;
  description: string;
  image?: string;
  slug?: string;
  type?: 'website' | 'article' | 'video.movie';
  keywords?: string[];
  author?: string;
}

export interface MetaTagsInput {
  title: string;
  description: string;
  imageUrl: string;
  url: string;
}

export interface JsonLdPayload {
  id: string;
  data: Record<string, unknown>;
}

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly baseUrl = 'https://lamed148.com.br';
  private readonly defaultImage = `${this.baseUrl}/assets/Imagens/lamed-logo.png`;
  private readonly defaultFallbackImage = 'assets/Imagens/Fundo_Lamed-total.png';
  private readonly siteName = 'Lamed';

  private readonly titleService = inject(Title);
  private readonly metaService = inject(Meta);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  constructor(@Inject(DOCUMENT) private readonly doc: Document) {}

  private currentPath = '/';

  init(): void {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((event) => {
        this.currentPath = event.urlAfterRedirects;
      });

    this.updateDefaultTags();
    this.emitGlobalJsonLd();
  }

  private emitGlobalJsonLd(): void {
    const org = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: this.siteName,
      url: this.baseUrl,
      logo: this.defaultImage,
      description:
        'Projeto Lamed — estudos bíblicos semanais, artigos e guias para adolescentes e jovens.',
      sameAs: [
        'https://www.youtube.com/channel/UC2PYvVmcJBLt9ymvBpnXO9A',
      ],
    };

    const site = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: this.siteName,
      url: this.baseUrl,
      inLanguage: 'pt-BR',
      potentialAction: {
        '@type': 'SearchAction',
        target: `${this.baseUrl}/?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    };

    // Single @graph payload keeps things under one <script> tag.
    this.updateJsonLd({
      id: 'global-org-website',
      data: {
        '@context': 'https://schema.org',
        '@graph': [org, site],
      },
    });
  }

  updateTitle(title: string): void {
    this.titleService.setTitle(`${title} | ${this.siteName}`);
  }

  updateMetaTags(config: SeoConfig): void {
    const imageUrl = config.image
      ? config.image.startsWith('http')
        ? config.image
        : `${this.baseUrl}/${config.image.replace(/^\/+/, '')}`
      : this.defaultImage;

    const canonicalUrl = config.slug
      ? `${this.baseUrl}/${config.slug.replace(/^\/+/, '')}`
      : this.doc.URL;

    const tags: MetaDefinition[] = [
      { name: 'description', content: config.description },
      { name: 'author', content: config.author || this.siteName },
      { name: 'keywords', content: config.keywords?.join(', ') || 'estudos bíblicos, lamed, teologia, artigos' },
      { property: 'og:title', content: config.title },
      { property: 'og:description', content: config.description },
      { property: 'og:type', content: config.type || 'website' },
      { property: 'og:url', content: canonicalUrl },
      { property: 'og:image', content: imageUrl },
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' },
      { property: 'og:site_name', content: this.siteName },
      { property: 'og:locale', content: 'pt_BR' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: config.title },
      { name: 'twitter:description', content: config.description },
      { name: 'twitter:image', content: imageUrl },
    ];

    tags.forEach((tag) => this.metaService.updateTag(tag));
    this.updateCanonicalUrl(canonicalUrl);
    this.updateTitle(config.title);
  }

  updateTags(input: string | MetaTagsInput, description?: string, imageUrl?: string, url?: string): void {
    const payload: MetaTagsInput = typeof input === 'string'
      ? {
          title: input,
          description: description ?? '',
          imageUrl: imageUrl ?? this.defaultFallbackImage,
          url: url ?? this.currentPath,
        }
      : { ...input, url: input.url || this.currentPath };

    const fullTitle = `${payload.title} | Lamed`;
    const fullImage = this.toAbsoluteUrl(payload.imageUrl);
    const fullUrl = this.toAbsoluteUrl(payload.url);

    this.titleService.setTitle(fullTitle);
    this.metaService.updateTag({ name: 'description', content: payload.description });
    this.metaService.updateTag({ property: 'og:title', content: fullTitle });
    this.metaService.updateTag({ property: 'og:description', content: payload.description });
    this.metaService.updateTag({ property: 'og:image', content: fullImage });
    this.metaService.updateTag({ property: 'og:url', content: fullUrl });
    this.updateCanonicalUrl(fullUrl);
  }

  updateDefaultTags(): void {
    this.updateTags({
      title: 'Lamed | Estudo da Bíblia para Adolescentes e Jovens',
      description:
        'Aprofunde seu estudo da Lição da Escola Sabatina! O Lamed oferece vídeos semanais, artigos e guias de estudo para adolescentes e professores. Explore nossos recursos.',
      imageUrl: this.defaultFallbackImage,
      url: '/',
    });
  }

  updateCanonicalUrl(url: string): void {
    let link: HTMLLinkElement =
      this.doc.querySelector("link[rel='canonical']") || this.doc.createElement('link');
    link.setAttribute('rel', 'canonical');
    link.setAttribute('href', url);
    if (!link.parentNode) {
      this.doc.head.appendChild(link);
    }
  }

  updateJsonLd(payload: JsonLdPayload): void {
    const selector = `script[type="application/ld+json"][data-seo-id="${payload.id}"]`;
    let script: HTMLScriptElement | null = this.doc.querySelector(selector);
    if (!script) {
      script = this.doc.createElement('script');
      script.setAttribute('type', 'application/ld+json');
      script.setAttribute('data-seo-id', payload.id);
      this.doc.head.appendChild(script);
    }
    script.textContent = JSON.stringify(payload.data);
  }

  removeJsonLd(id: string): void {
    const selector = `script[type="application/ld+json"][data-seo-id="${id}"]`;
    const el = this.doc.querySelector(selector);
    if (el) el.remove();
  }

  setNoindex(enabled: boolean): void {
    const value = enabled ? 'noindex, nofollow' : 'index, follow';
    this.metaService.updateTag({ name: 'robots', content: value });
  }

  private toAbsoluteUrl(path: string): string {
    if (!path) return `${this.baseUrl}/`;
    if (/^https?:\/\//.test(path)) return path;
    if (path.startsWith('/')) return `${this.baseUrl}${path}`;
    return `${this.baseUrl}/${path}`;
  }
}
