import { Component, inject, signal } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BundleCardComponent } from '../shared/bundle-card/bundle-card.component';
import { LucideAngularModule } from 'lucide-angular';
import { BundleService, Bundle } from '../../services/bundle.service';

@Component({
  selector: 'app-bundle-list',
  standalone: true,
  imports: [CommonModule, BundleCardComponent, LucideAngularModule, RouterLink],
  templateUrl: './bundle-list.html',
  styles: []
})
export class BundleList {
  private bundleService = inject(BundleService);
  private sanitizer = inject(DomSanitizer);

  bundles = signal<Bundle[]>([]);
  loading = signal<boolean>(true);

  currentPage = signal<number>(1);
  pageHistory = signal<string[]>([]); // stack of startAfterIds
  hasNextPage = signal<boolean>(false);

  // Page size is dynamic: Page 1 = 9 (1 hero + 8 grid items), Page 2+ = 8 items

  constructor() {
    this.loadPage();
  }

  loadPage() {
    this.loading.set(true);
    const startAfterId = this.currentPage() > 1 ? this.pageHistory()[this.currentPage() - 2] : undefined;
    
    // Page 1 has 1 hero + 8 grid items = 9 total. Subsequent pages have 8 grid items.
    const currentPageSize = this.currentPage() === 1 ? 9 : 8;
    const fetchLimit = currentPageSize + 1;

    this.bundleService.getBundles(fetchLimit, startAfterId, true).subscribe({
      next: (data) => {
        if (data.length > currentPageSize) {
          this.hasNextPage.set(true);
          this.bundles.set(data.slice(0, currentPageSize));
        } else {
          this.hasNextPage.set(false);
          this.bundles.set(data);
        }
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error fetching bundles page:', err);
        this.loading.set(false);
      }
    });
  }

  nextPage() {
    if (!this.hasNextPage()) return;
    const currentList = this.bundles();
    if (currentList.length === 0) return;
    const lastItemId = currentList[currentList.length - 1].id;

    this.pageHistory.update(history => [...history, lastItemId]);
    this.currentPage.update(p => p + 1);
    this.loadPage();
  }

  prevPage() {
    if (this.currentPage() <= 1) return;
    this.currentPage.update(p => p - 1);
    this.pageHistory.update(history => history.slice(0, -1));
    this.loadPage();
  }

  getSafeUrl(videoId: string | undefined): SafeResourceUrl | null {
    if (!videoId) return null;
    const embedUrl = `https://www.youtube.com/embed/${videoId}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  }
}
