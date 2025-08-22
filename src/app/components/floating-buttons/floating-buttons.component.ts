import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { LucideAngularModule } from 'lucide-angular';
import { HeaderVisibilityService } from '../../services/header-visibility.service';

@Component({
  selector: 'app-floating-buttons',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './floating-buttons.component.html',
  styleUrls: ['./floating-buttons.component.css']
})
export class FloatingButtonsComponent implements OnDestroy {
  showBackToTopButton = false;
  showBackToArticlesButton = false;

  private isArticlePage = false;
  private isHeaderVisible = true;
  private subscriptions = new Subscription();

  constructor(
    private router: Router,
    private headerVisibilityService: HeaderVisibilityService
  ) {
    const routerSubscription = this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.isArticlePage = event.urlAfterRedirects.includes('/artigo/');
      this.updateButtonsVisibility();
    });

    const headerSubscription = this.headerVisibilityService.headerVisible$.subscribe(isVisible => {
      this.isHeaderVisible = isVisible;
      this.updateButtonsVisibility();
    });

    this.subscriptions.add(routerSubscription);
    this.subscriptions.add(headerSubscription);
  }

  private updateButtonsVisibility() {
    const isHeaderHidden = !this.isHeaderVisible;
    this.showBackToTopButton = isHeaderHidden;
    this.showBackToArticlesButton = isHeaderHidden && this.isArticlePage;
    console.log(`[Buttons] Header hidden: ${isHeaderHidden}, Is article page: ${this.isArticlePage}, Show back-to-top: ${this.showBackToTopButton}, Show back-to-articles: ${this.showBackToArticlesButton}`);
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
