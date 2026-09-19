import { Component, signal, inject, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter, map, mergeMap } from 'rxjs/operators';
import { Header } from './componentes/shared/header/header';
import { Footer } from './componentes/shared/footer/footer';
import { BibleDrawerComponent } from './componentes/shared/bible-drawer/bible-drawer.component';
import { SeoService } from './core/services/seo.service';
import { AnalyticsService } from './core/services/analytics.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer, BibleDrawerComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly title = signal('frontend');
  protected isEmbedded = signal(false);

  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private seoService = inject(SeoService);
  private analyticsService = inject(AnalyticsService);

  constructor() {
    // Analytics inicializado via provider (UserTrackingService/ScreenTrackingService)
  }

  ngOnInit() {
    this.checkEmbedded();

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => this.activatedRoute),
      map(route => {
        while (route.firstChild) route = route.firstChild;
        return route;
      }),
      mergeMap(route => route.data)
    ).subscribe(data => {
      this.checkEmbedded();
      
      // Atualiza SEO se houver dados na rota
      if (data['title']) {
        this.seoService.updateMetaTags({
          title: data['title'],
          description: data['description'] || 'Estudos bíblicos profundos e recursos para sua jornada espiritual.',
          image: data['image'], // Pode vir da rota se estático
          type: 'website'
        });
      }

      // Garante que ao mudar de página sempre volte ao topo
      if (typeof window !== 'undefined' && !window.location.hash) {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      }

      // Noindex opt-in via route data
      this.seoService.setNoindex(!!data['noindex']);
    });
  }

  private checkEmbedded() {
    // Modo embutido deve ser ativado apenas se explicitamente solicitado via query param
    const routerHasEmbedded = this.router.url.includes('embedded=true');
    const windowHasEmbedded = typeof window !== 'undefined' && window.location.search.includes('embedded=true');

    const isEmbeddedUrl = routerHasEmbedded || windowHasEmbedded;
                          
    this.isEmbedded.set(!!isEmbeddedUrl);
  }
}
