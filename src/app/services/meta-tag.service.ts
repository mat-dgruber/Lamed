import { Injectable } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class MetaTagService {

  private baseUrl = 'https://lamed148.com.br';

  constructor(private titleService: Title, private metaService: Meta) { }

  updateTags(title: string, description: string, imageUrl: string, url: string) {
    const fullTitle = `${title} | Lamed`;
    this.titleService.setTitle(fullTitle);
    this.metaService.updateTag({ name: 'description', content: description });
    this.metaService.updateTag({ property: 'og:title', content: fullTitle });
    this.metaService.updateTag({ property: 'og:description', content: description });
    this.metaService.updateTag({ property: 'og:image', content: `${this.baseUrl}/${imageUrl}` });
    this.metaService.updateTag({ property: 'og:url', content: `${this.baseUrl}${url}` });
  }

  updateDefaultTags() {
    const defaultTitle = 'Lamed | Estudo da Bíblia para Adolescentes e Jovens';
    const defaultDescription = 'Aprofunde seu estudo da Lição da Escola Sabatina! O Lamed oferece vídeos semanais, artigos e guias de estudo para adolescentes e professores. Explore nossos recursos.';
    const defaultImageUrl = 'assets/Imagens/Fundo_Lamed-total.png';
    const defaultUrl = '/';

    this.titleService.setTitle(defaultTitle);
    this.metaService.updateTag({ name: 'description', content: defaultDescription });
    this.metaService.updateTag({ property: 'og:title', content: 'Lamed | Estudo da Bíblia para Adolescentes' });
    this.metaService.updateTag({ property: 'og:description', content: defaultDescription });
    this.metaService.updateTag({ property: 'og:image', content: `${this.baseUrl}/${defaultImageUrl}` });
    this.metaService.updateTag({ property: 'og:url', content: `${this.baseUrl}${defaultUrl}` });
  }
}
