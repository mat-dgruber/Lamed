import { Component, OnInit, signal, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { BundleService, Bundle } from '../../services/bundle.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements OnInit {
  private bundleService = inject(BundleService);
  private sanitizer = inject(DomSanitizer);

  // Data
  latestBundle = toSignal(this.bundleService.getLatestBundle());
  
  // Computed Resource URL
  featuredVideoUrl = signal<SafeResourceUrl | undefined>(undefined);

  // Animation State
  showHeroText1 = signal(true);
  heroText1Opacity = signal(1);
  showHeroText2 = signal(false);
  heroText2Opacity = signal(0);

  constructor() {
    effect(() => {
      const bundle = this.latestBundle();
      if (bundle && bundle.video_data) {
        let url = bundle.video_data.url;
        // Simple YouTube ID extraction manual fallback if clean
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
           // We assume the stored URL might be full or embed.
           // Ideally, should use the ID. For now trusting full embed URL if standard.
           // Or converting simple watch URL to embed:
           if(url.includes('watch?v=')) {
             url = url.replace('watch?v=', 'embed/');
           } else if (url.includes('youtu.be/')) {
             url = url.replace('youtu.be/', 'www.youtube.com/embed/');
           }
        }
        this.featuredVideoUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(url));
      }
    });
  }

  ngOnInit() {
    this.runHeroAnimation();
  }

  runHeroAnimation() {
    // Hero text animation logic
    setTimeout(() => {
      this.heroText1Opacity.set(0);
      
      setTimeout(() => {
        this.showHeroText1.set(false);
        this.showHeroText2.set(true);
        
        // A small delay to ensure the element is in the DOM before animating opacity
        setTimeout(() => {
          this.heroText2Opacity.set(1);
        }, 100);
      }, 500); // Wait for fade out
    }, 1800); // Initial delay
  }
}
