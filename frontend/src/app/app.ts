import { Component, signal, inject, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter, map, mergeMap } from 'rxjs/operators';
import { Header } from './componentes/shared/header/header';
import { Footer } from './componentes/shared/footer/footer';
import { SeoService } from './core/services/seo.service';
import { AnalyticsService } from './core/services/analytics.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer],
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
    });
  }

  private checkEmbedded() {
    // Debugging embedded state
    // Check router URL, window location, and iframe context
    const inIframe = (() => {
      try {
        return window.self !== window.top;
      } catch (e) {
        return true;
      }
    })();

    const routerHasEmbedded = this.router.url.includes('embedded=true');
    const windowHasEmbedded = window.location.search.includes('embedded=true');

    const isEmbeddedUrl = routerHasEmbedded || 
                          windowHasEmbedded ||
                          inIframe;
                          
    this.isEmbedded.set(!!isEmbeddedUrl);
  }
}
