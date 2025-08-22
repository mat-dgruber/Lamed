import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-floating-buttons',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './floating-buttons.component.html',
  styleUrls: ['./floating-buttons.component.css']
})
export class FloatingButtonsComponent {
  showBackToTopButton = false;
  showBackToArticlesButton = false;
  private isArticlePage = false;

  constructor(private router: Router) {
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.isArticlePage = event.urlAfterRedirects.includes('/artigo/');
      this.updateButtonsVisibility();
    });
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.updateButtonsVisibility();
  }

  private updateButtonsVisibility() {
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;

    this.showBackToTopButton = scrollPosition > 300;
    this.showBackToArticlesButton = this.isArticlePage;
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
