import { Component, OnInit, inject, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { LucideAngularModule } from 'lucide-angular';
import { ArticleService, Article } from '../../services/article.service';
import { Timestamp } from '@angular/fire/firestore';

@Component({
  selector: 'app-article-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule],
  templateUrl: './article-detail.component.html',
  styleUrl: './article-detail.component.scss'
})
export class ArticleDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private articleService = inject(ArticleService);
  private sanitizer = inject(DomSanitizer);

  article = signal<Article | undefined>(undefined);
  loading = signal<boolean>(true);
  safeContent: SafeHtml | null = null;
  isButtonVisible = signal(false);
  isEmbedded = signal(false);

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isButtonVisible.set(window.scrollY > 200);
  }

  ngOnInit() {
    // Check for embedded mode
    this.route.queryParams.subscribe(params => {
        this.isEmbedded.set(params['embedded'] === 'true');
    });

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadArticle(id);
      }
    });
  }

  loadArticle(id: string) {
    this.loading.set(true);
    this.articleService.getArticleById(id).subscribe({
      next: (data) => {
        this.article.set(data);
        if (data?.content) {
          // Beware of scripts if any. Trusting content from our own DB.
          this.safeContent = this.sanitizer.bypassSecurityTrustHtml(data.content);
        }
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.loading.set(false);
      }
    });
  }

  toDate(timestamp: any): Date | null {
    if (!timestamp) return null;
    // Firebase Timestamp has toDate()
    if (timestamp instanceof Timestamp) {
      return timestamp.toDate();
    }
    // If it's already a date or string (fallback)
    return new Date(timestamp);
  }
}
