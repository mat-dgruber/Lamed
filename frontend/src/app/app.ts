import { Component, signal } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Header } from './componentes/shared/header/header';
import { Footer } from './componentes/shared/footer/footer';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('frontend');
  protected isEmbedded = signal(false);

  constructor(private router: Router) {
    // Check initial state from window location (more robust for iframe start)
    this.checkEmbedded();

    // Monitor URL changes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.checkEmbedded();
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
