import { Component, OnInit, signal, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { BundleService, Bundle } from '../../services/bundle.service';
import { ArticleService, Article } from '../../services/article.service';
import { GoogleDriveImagePipe } from '../../pipes/google-drive-image.pipe';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule, GoogleDriveImagePipe],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements OnInit {
  private bundleService = inject(BundleService);
  private articleService = inject(ArticleService);
  private sanitizer = inject(DomSanitizer);

  isLoading = signal(true);

  // Data Signals
  latestBundle = toSignal(this.bundleService.getLatestBundle());
  latestArticles = toSignal(
    this.articleService.getArticles(3).pipe(
      catchError((err) => {
        console.error('Erro ao buscar artigos recentes para a home:', err);
        return of([] as Article[]);
      })
    ),
    { initialValue: undefined }
  );
  
  // Computed Resource URL
  featuredVideoUrl = signal<SafeResourceUrl | undefined>(undefined);

  // Animation State (preserved for backwards-compatibility)
  showHeroText1 = signal(false);
  heroText1Opacity = signal(0);
  showHeroText2 = signal(true);
  heroText2Opacity = signal(1);

  constructor() {
    effect(() => {
      const bundle = this.latestBundle();
      if (bundle && bundle.video_id) {
        const url = `https://www.youtube.com/embed/${bundle.video_id}`;
        this.featuredVideoUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(url));
      }
    });
  }

  ngOnInit() {
    // Immediate LCP & interactive state
  }
}
