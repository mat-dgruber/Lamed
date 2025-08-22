import { Component, HostListener, signal } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { Header } from './header/header';
import { Footer } from "./footer/footer"; 
import { FloatingButtonsComponent } from './components/floating-buttons/floating-buttons.component';
import { HeaderVisibilityService } from './services/header-visibility.service';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, Header, Footer, FloatingButtonsComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
  standalone: true,
})
export class App {
  protected readonly title = signal('angular-lamed');
  isHeaderHidden = false;
  private scrollThreshold = 400;

  constructor(
    private headerVisibilityService: HeaderVisibilityService,
    private router: Router
  ) {
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      const path = event.urlAfterRedirects;
      if (path.endsWith('/videos')) {
        this.scrollThreshold = 90;
      } else if (path.endsWith('/doacao')) {
        this.scrollThreshold = 80;
      } else if (path.endsWith('/artigos')) {
        this.scrollThreshold = 50;
      } else if (path.endsWith('/sobre')) {
        this.scrollThreshold = 100;
      } else if (path.includes('/politica') || path.includes('/termos')) {
        this.scrollThreshold = 150;
      } else {
        this.scrollThreshold = 200; // Default for index and others
      }
      console.log(`[App] Route changed to: ${path}, scrollThreshold set to: ${this.scrollThreshold}`);
    });
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    const shouldHide = scrollPosition > this.scrollThreshold;
    // console.log(`[App] Scroll position: ${scrollPosition}, Threshold: ${this.scrollThreshold}, Should hide: ${shouldHide}`);

    if (shouldHide !== this.isHeaderHidden) {
      console.log(`[App] Header visibility changing to: ${!shouldHide}`);
      this.isHeaderHidden = shouldHide;
      this.headerVisibilityService.setHeaderVisibility(!this.isHeaderHidden);
    }
  }
}