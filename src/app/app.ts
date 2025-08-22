import { Component, HostListener, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './header/header';
import { Footer } from "./footer/footer"; 
import { FloatingButtonsComponent } from './components/floating-buttons/floating-buttons.component';
import { HeaderVisibilityService } from './services/header-visibility.service';
import { CommonModule } from '@angular/common';

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

  constructor(private headerVisibilityService: HeaderVisibilityService) {}

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    const shouldHide = scrollPosition > 100; // Simplified threshold

    if (shouldHide !== this.isHeaderHidden) {
      this.isHeaderHidden = shouldHide;
      this.headerVisibilityService.setHeaderVisibility(!this.isHeaderHidden);
    }
  }
}