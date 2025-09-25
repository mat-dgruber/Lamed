import { Component, OnInit, signal } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { Header } from './header/header';
import { Footer } from "./footer/footer";
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
  protected readonly title = signal('angular-lamed');

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      // Envia um evento de page_view para o Google Analytics
      gtag('event', 'page_view', {
        page_title: this.title(), // ou um título mais dinâmico se disponível
        page_location: event.urlAfterRedirects,
        page_path: event.urlAfterRedirects
      });
    });
  }
}