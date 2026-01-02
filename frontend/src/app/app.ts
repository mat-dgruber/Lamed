import { Component, OnInit, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { Header } from './components/header/header';
import { Footer } from "./components/footer/footer";
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs';

// Declara a função gtag para que o TypeScript não reclame, pois ela é carregada globalmente pelo script no index.html
declare let gtag: Function;

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, Header, Footer],
  templateUrl: './app.html',
  styleUrl: './app.css',
  standalone: true,
})
export class App implements OnInit {
  isAdminRoute = signal(false);

  constructor(private router: Router, private titleService: Title) {}

  ngOnInit(): void {
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      // Check if it's an admin route
      this.isAdminRoute.set(event.urlAfterRedirects.startsWith('/admin'));

      // Envia um evento de page_view para o Google Analytics
      if (typeof gtag === 'function') {
        gtag('event', 'page_view', {
          page_title: this.titleService.getTitle(),
          page_location: event.urlAfterRedirects,
          page_path: event.urlAfterRedirects
        });
      }
    });
  }
}
