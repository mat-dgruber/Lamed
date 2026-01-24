import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DomSanitizer, SafeHtml, SafeResourceUrl } from '@angular/platform-browser';
import { LucideAngularModule } from 'lucide-angular';
import { BundleService, Bundle } from '../../services/bundle.service';

@Component({
  selector: 'app-bundle-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-zinc-50 dark:bg-zinc-950 pb-20">
      
      <!-- Loading State -->
      <div *ngIf="loading()" class="flex h-96 items-center justify-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>

      <div *ngIf="bundle() as bundle" class="container mx-auto px-4 pt-6 max-w-7xl">
        
        <!-- Breadcrumb / Back -->
        <a routerLink="/" class="mb-6 inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-blue-600 transition-colors">
          <lucide-icon [name]="'arrow-left'" [size]="16"></lucide-icon>
          Voltar para Home
        </a>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <!-- Main Content (Video + Article) -->
          <div class="lg:col-span-2 space-y-8">
            
            <!-- Video Player -->
            <div class="aspect-video w-full overflow-hidden rounded-xl bg-black shadow-lg ring-1 ring-zinc-900/10">
              <iframe 
                *ngIf="safeVideoUrl"
                [src]="safeVideoUrl" 
                class="h-full w-full border-0" 
                allowfullscreen
                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture">
              </iframe>
              <div *ngIf="!safeVideoUrl" class="flex h-full items-center justify-center text-zinc-500">
                Vídeo não disponível
              </div>
            </div>

            <!-- Header -->
            <div>
              <div class="flex items-center gap-3 mb-3">
                 <span class="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                   Semana {{ bundle.week_number }}
                 </span>
                 <span class="text-sm text-zinc-500" *ngIf="bundle.published_at">
                   Publicado em {{ bundle.published_at | date:'longDate' }}
                 </span>
              </div>
              <h1 class="text-3xl font-bold text-zinc-900 dark:text-zinc-50 sm:text-4xl">{{ bundle.title }}</h1>
              <p *ngIf="bundle.author" class="mt-2 text-base text-zinc-600 dark:text-zinc-400">
                Por <span class="font-semibold text-zinc-900 dark:text-zinc-200">{{ bundle.author }}</span>
              </p>
            </div>

            <!-- Article Content -->
            <div class="prose prose-lg prose-blue max-w-none dark:prose-invert bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800">
              <div [innerHTML]="safeArticleContent"></div>
            </div>

          </div>

          <!-- Sidebar (Resources) -->
          <div class="lg:col-span-1 space-y-6">
            
            <!-- Download Card -->
            <div class="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800">
              <h3 class="font-semibold text-lg mb-4 flex items-center gap-2">
                <lucide-icon [name]="'download'" [size]="20"></lucide-icon>
                Material de Apoio
              </h3>
              
              <div class="space-y-3">
                <div *ngFor="let res of bundle.resources" class="group flex items-start gap-3 rounded-lg border border-zinc-100 p-3 transition-colors hover:bg-zinc-50 hover:border-blue-200 dark:border-zinc-800 dark:hover:bg-zinc-800">
                  <div class="relative flex h-10 w-10 shrink-0 items-center justify-center rounded bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                     <!-- Icon mapping could be improved -->
                     <lucide-icon [name]="'file-text'" [size]="20"></lucide-icon>
                  </div>
                  <div class="min-w-0 flex-1">
                    <p class="font-medium text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600">{{ res.title }}</p>
                    <p class="text-xs text-zinc-500 uppercase">{{ res.type }}</p>
                  </div>
                  <a [href]="res.url" target="_blank" class="flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-900">
                    <lucide-icon [name]="'download-cloud'" [size]="16"></lucide-icon>
                  </a>
                </div>

                <div *ngIf="bundle.resources.length === 0" class="text-sm text-zinc-500 italic">
                  Nenhum material extra disponível.
                </div>
              </div>
            </div>

            <!-- Share / Meta -->
            <div class="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-100 dark:border-blue-800">
              <h4 class="font-medium text-blue-900 dark:text-blue-100 mb-2">Compartilhe este estudo</h4>
              <p class="text-sm text-blue-700 dark:text-blue-300 mb-4">Ajude a espalhar o conhecimento da Torá.</p>
              <button class="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors">
                Copiar Link
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  `
})
export class BundleDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private bundleService = inject(BundleService);
  private sanitizer = inject(DomSanitizer);

  bundle = signal<Bundle | null>(null);
  loading = signal<boolean>(true);
  
  safeVideoUrl: SafeResourceUrl | null = null;
  safeArticleContent: SafeHtml | null = null;

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadBundle(id);
      }
    });
  }

  loadBundle(id: string) {
    this.loading.set(true);
    this.bundleService.getBundleById(id).subscribe({
      next: (data) => {
        this.bundle.set(data);
        if (data.video_data?.url) {
           // Basic Youtube Embed Handling
           const videoId = this.extractYoutubeId(data.video_data.url);
           if (videoId) {
             this.safeVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${videoId}`);
           }
        }
        if (data.article_content) {
          this.safeArticleContent = this.sanitizer.bypassSecurityTrustHtml(data.article_content);
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  private extractYoutubeId(url: string): string | null {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  }
}
