import { Component, inject, signal } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BundleCardComponent } from '../shared/bundle-card/bundle-card.component';
import { LucideAngularModule } from 'lucide-angular';
import { BundleService, Bundle } from '../../services/bundle.service';
import { GoogleDriveImagePipe } from '../../pipes/google-drive-image.pipe';

@Component({
  selector: 'app-bundle-list',
  standalone: true,
  imports: [CommonModule, BundleCardComponent, LucideAngularModule, RouterLink, GoogleDriveImagePipe],
  templateUrl: './bundle-list.html',
  styles: [`
    :host a.hero-cta-btn,
    :host a.hero-cta-btn:hover,
    :host a.hero-cta-btn:focus,
    :host a.hero-cta-btn:active {
      color: #ffffff !important;
      text-decoration: none !important;
    }
    :host a.hero-cta-btn * {
      color: inherit !important;
      text-decoration: none !important;
    }
  `]
})
export class BundleList {
  private bundleService = inject(BundleService);
  private sanitizer = inject(DomSanitizer);

  bundles = signal<Bundle[]>([]);
  loading = signal<boolean>(true);
  hasError = signal<boolean>(false);
  playHeroVideo = signal<boolean>(false);

  currentPage = signal<number>(1);
  pageHistory = signal<string[]>([]); // stack of startAfterIds
  hasNextPage = signal<boolean>(false);

  // Page size is dynamic: Page 1 = 9 (1 hero + 8 grid items), Page 2+ = 8 items

  constructor() {
    this.loadPage();
  }

  loadPage() {
    this.loading.set(true);
    this.hasError.set(false);
    this.playHeroVideo.set(false);
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
        this.hasError.set(true);
        this.loading.set(false);
      }
    });
  }

  startHeroVideo() {
    this.playHeroVideo.set(true);
  }

  onHeroImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/Imagens/Fundo_Lamed-total.png';
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

  getDistinctResourceTypes(bundle: Bundle | undefined): string[] {
    if (!bundle || !bundle.resources || bundle.resources.length === 0) return [];
    const typeLabels: Record<string, string> = {
      pdf: 'PDF',
      pptx: 'Slides',
      slides: 'Slides',
      mapa_mental: 'Mapa Mental',
      infografico: 'Infográfico',
      infographic: 'Infográfico',
      doc: 'Documento',
      audio: 'Áudio',
      video: 'Vídeo',
      guia: 'Guia'
    };
    const types = new Set<string>();
    for (const r of bundle.resources) {
      if (r.type && typeLabels[r.type]) {
        types.add(typeLabels[r.type]);
      } else if (r.type) {
        types.add(r.type.toUpperCase());
      }
    }
    return Array.from(types);
  }

  getSafeUrl(videoId: string | undefined): SafeResourceUrl | null {
    if (!videoId) return null;
    const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  }
}
