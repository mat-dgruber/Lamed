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
  template: `
    <div class="min-h-screen bg-zinc-50 pb-20">
      
      <!-- Loading State -->
      <div *ngIf="loading()" class="flex h-96 items-center justify-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>

      <div *ngIf="article() as loadedArticle" class="container mx-auto px-4 pt-6 max-w-4xl">
        
        <!-- Breadcrumb / Back -->
        <a routerLink="/artigos" class="mb-6 inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-orange-500 transition-colors">
          <lucide-icon [name]="'arrow-left'" [size]="16"></lucide-icon>
          Voltar para Artigos
        </a>

        <!-- Article Container -->
        <div class="bg-white rounded-2xl shadow-sm ring-1 ring-zinc-200 overflow-hidden">
          
          <!-- Banner Image -->
          <div *ngIf="loadedArticle.banner_image_url" class="relative h-64 md:h-96 w-full overflow-hidden">
            <img [src]="loadedArticle.banner_image_url" [alt]="loadedArticle.title" class="h-full w-full object-cover">
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          </div>

          <!-- Content Wrapper -->
          <div class="p-8 md:p-12">
            
            <!-- Header -->
            <div class="mb-8">
              <div class="flex flex-wrap items-center gap-3 mb-4 text-sm">
                 <span class="inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 font-medium text-orange-800">
                   Artigo
                 </span>
                 <span class="text-zinc-500 flex items-center gap-1" *ngIf="loadedArticle.published_at">
                   <lucide-icon [name]="'calendar'" [size]="14"></lucide-icon>
                   {{ toDate(loadedArticle.published_at) | date:'longDate' }}
                 </span>
                 <span class="text-zinc-500 flex items-center gap-1" *ngIf="loadedArticle.author">
                   <lucide-icon [name]="'user'" [size]="14"></lucide-icon>
                   {{ loadedArticle.author }}
                 </span>
              </div>
              
              <h1 class="text-3xl md:text-4xl font-bold text-zinc-900 leading-tight mb-4">
                {{ loadedArticle.title }}
              </h1>
              
              <p *ngIf="loadedArticle.description" class="text-lg text-zinc-600 leading-relaxed italic border-l-4 border-orange-500 pl-4">
                {{ loadedArticle.description }}
              </p>
            </div>

            <!-- Divider -->
            <hr class="border-zinc-100 mb-8">

            <!-- HTML Content -->
            <div class="prose prose-lg prose-orange max-w-none article-content">
              <div [innerHTML]="safeContent"></div>
          </div>
        </div>
      </div>
      
      <!-- Floating Back Button -->
      <a routerLink="/artigos" 
         class="floating-back-button" 
         id="back-to-articles-button" 
         title="Voltar para Artigos" 
         [class.visible]="isButtonVisible()">
        <lucide-icon [name]="'arrow-left'" [size]="24"></lucide-icon>
        <span class="button-text-artigos">Voltar para Artigos</span>
      </a>
      
      <!-- Not Found State -->
      <div *ngIf="!loading() && !article()" class="flex h-96 flex-col items-center justify-center text-center px-4">
        <lucide-icon [name]="'file-question'" [size]="48" class="text-zinc-400 mb-4"></lucide-icon>
        <h3 class="text-lg font-medium text-zinc-900 dark:text-white">Artigo não encontrado</h3>
        <p class="text-zinc-500 mt-2">O artigo que você procura pode ter sido removido ou não existe.</p>
        <a routerLink="/artigos" class="mt-6 btn-primary">Voltar para Artigos</a>
      </div>

    </div>
  `
})
export class ArticleDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private articleService = inject(ArticleService);
  private sanitizer = inject(DomSanitizer);

  article = signal<Article | undefined>(undefined);
  loading = signal<boolean>(true);
  safeContent: SafeHtml | null = null;
  isButtonVisible = signal(false);

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isButtonVisible.set(window.scrollY > 200);
  }

  ngOnInit() {
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
