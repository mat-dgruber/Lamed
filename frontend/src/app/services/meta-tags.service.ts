import { DestroyRef, Injectable, inject } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export interface MetaTagsInput {
  title: string;
  description: string;
  imageUrl: string;
  url: string;
}

@Injectable({
  providedIn: 'root'
})
export class MetaTagsService {
  private readonly baseUrl = 'https://lamed148.com.br';
  private readonly titleService = inject(Title);
  private readonly metaService = inject(Meta);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

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
  }

  updateTags(input: string | MetaTagsInput, description?: string, imageUrl?: string, url?: string): void {
    const payload: MetaTagsInput = typeof input === 'string'
      ? {
          title: input,
          description: description ?? '',
          imageUrl: imageUrl ?? 'assets/Imagens/Fundo_Lamed-total.png',
          url: url ?? this.currentPath
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
  }

  updateDefaultTags(): void {
    this.updateTags({
      title: 'Lamed | Estudo da Bíblia para Adolescentes e Jovens',
      description:
        'Aprofunde seu estudo da Lição da Escola Sabatina! O Lamed oferece vídeos semanais, artigos e guias de estudo para adolescentes e professores. Explore nossos recursos.',
      imageUrl: 'assets/Imagens/Fundo_Lamed-total.png',
      url: '/'
    });
  }

  private toAbsoluteUrl(path: string): string {
    if (!path) return this.baseUrl + '/';
    if (/^https?:\/\//.test(path)) return path;
    if (path.startsWith('/')) return `${this.baseUrl}${path}`;
    return `${this.baseUrl}/${path}`;
  }
}
