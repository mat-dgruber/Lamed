
import { Injectable, Inject } from '@angular/core';
import { Title, Meta, MetaDefinition } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';

export interface SeoConfig {
  title: string;
  description: string;
  image?: string;
  slug?: string;
  type?: 'website' | 'article' | 'video.movie';
  keywords?: string[];
  author?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  private readonly defaultImage = 'https://lamed.com.br/assets/Imagens/lamed-logo.png'; // Validar URL final em produção
  private readonly siteName = 'Lamed';
  private readonly baseUrl = 'https://lamed.com.br'; // Ajustar conforme domínio real

  constructor(
    private titleService: Title,
    private metaService: Meta,
    @Inject(DOCUMENT) private doc: Document
  ) {}

  updateTitle(title: string) {
    this.titleService.setTitle(`${title} | ${this.siteName}`);
  }

  updateMetaTags(config: SeoConfig) {
    // Top-level metadata
    this.updateTitle(config.title);
    
    // Preparar URL absoluta da imagem
    const imageUrl = config.image 
      ? (config.image.startsWith('http') ? config.image : `${this.baseUrl}/${config.image}`) 
      : this.defaultImage;

    // Preparar URL canônica
    const canonicalUrl = config.slug 
      ? `${this.baseUrl}/${config.slug.startsWith('/') ? config.slug.substring(1) : config.slug}`
      : this.doc.URL;

    // Definições de tags
    const tags: MetaDefinition[] = [
      // Standard
      { name: 'description', content: config.description },
      { name: 'author', content: config.author || this.siteName },
      { name: 'keywords', content: config.keywords?.join(', ') || 'estudos bíblicos, lamed, teologia, artigos' },

      // Open Graph / Facebook / WhatsApp
      { property: 'og:title', content: config.title },
      { property: 'og:description', content: config.description },
      { property: 'og:type', content: config.type || 'website' },
      { property: 'og:url', content: canonicalUrl },
      { property: 'og:image', content: imageUrl },
      { property: 'og:image:width', content: '1200' }, // Otimização WPP
      { property: 'og:image:height', content: '630' },  // Otimização WPP
      { property: 'og:site_name', content: this.siteName },
      { property: 'og:locale', content: 'pt_BR' },

      // Twitter
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: config.title },
      { name: 'twitter:description', content: config.description },
      { name: 'twitter:image', content: imageUrl },
    ];

    // Atualizar tags
    tags.forEach(tag => this.metaService.updateTag(tag));
    
    // Atualizar Canonical
    this.updateCanonicalUrl(canonicalUrl);
  }

  updateCanonicalUrl(url: string) {
    let link: HTMLLinkElement = this.doc.querySelector("link[rel='canonical']") || this.doc.createElement('link');
    link.setAttribute('rel', 'canonical');
    link.setAttribute('href', url);
    if (!link.parentNode) {
      this.doc.head.appendChild(link);
    }
  }
}
