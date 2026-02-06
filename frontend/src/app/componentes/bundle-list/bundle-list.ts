import { Component, inject, signal } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BundleCardComponent } from '../shared/bundle-card/bundle-card.component';
import { LucideAngularModule } from 'lucide-angular';
import { BundleService } from '../../services/bundle.service';

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
  bundles = this.bundleService.bundles;

  constructor() {
    this.bundleService.getBundles().subscribe();
  }

  getSafeUrl(videoId: string | undefined): SafeResourceUrl | null {
    if (!videoId) return null;
    const embedUrl = `https://www.youtube.com/embed/${videoId}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  }
}
