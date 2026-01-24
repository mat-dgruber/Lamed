import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { BundleService, Bundle } from '../../services/bundle.service';

@Component({
  selector: 'app-bundle-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LucideAngularModule],
  template: `
    <div class="container mx-auto px-6 py-8 max-w-4xl">
      <div class="mb-8 flex items-center justify-between">
        <h1 class="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          {{ isEditMode() ? 'Editar Bundle' : 'Novo Bundle' }}
        </h1>
        <div class="flex gap-3">
          <a routerLink="/admin" class="rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800">
            Cancelar
          </a>
          <button (click)="save()" class="rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50">
            {{ isSaving() ? 'Salvando...' : 'Salvar' }}
          </button>
        </div>
      </div>

      <form class="space-y-6 bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        
        <!-- Basic Info -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="col-span-2">
            <label class="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Título</label>
            <input type="text" [(ngModel)]="model.title" name="title" class="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950">
          </div>
          
          <div>
            <label class="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Semana (#)</label>
            <input type="number" [(ngModel)]="model.week_number" name="week_number" class="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950">
          </div>

          <div>
            <label class="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Autor</label>
            <input type="text" [(ngModel)]="model.author" name="author" class="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950">
          </div>
          
          <div class="col-span-2">
            <label class="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Descrição Curta</label>
            <textarea [(ngModel)]="model.description" name="description" rows="3" class="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950"></textarea>
          </div>
        </div>

        <!-- Video -->
        <div class="border-t border-zinc-100 pt-6 dark:border-zinc-800">
           <h3 class="mb-4 font-semibold">Vídeo</h3>
           <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
                <label class="block text-sm font-medium text-zinc-700 dark:text-zinc-300">URL do YouTube</label>
                <input type="text" [(ngModel)]="videoUrl" name="videoUrl" class="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950" placeholder="https://youtube.com/watch?v=...">
             </div>
             <div>
                <label class="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Capa (Thumbnail URL)</label>
                <input type="text" [(ngModel)]="model.thumbnail_url" name="thumbnail" class="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950">
             </div>
           </div>
        </div>

        <!-- Article (Simple Text Area for now, can be upgraded to Tiptap) -->
        <div class="border-t border-zinc-100 pt-6 dark:border-zinc-800">
           <h3 class="mb-4 font-semibold">Artigo (HTML)</h3>
           <p class="mb-2 text-xs text-zinc-500">Cole seu HTML ou texto aqui. Suporta tags &lt;p&gt;, &lt;b&gt;, &lt;img src="..."&gt;.</p>
           <textarea [(ngModel)]="model.article_content" name="article" rows="10" class="block w-full rounded-lg border border-zinc-300 px-3 py-2 font-mono text-sm shadow-sm focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950"></textarea>
        </div>

        <!-- Status -->
        <div class="flex items-center gap-3 border-t border-zinc-100 pt-6 dark:border-zinc-800">
           <input type="checkbox" [(ngModel)]="model.is_active" name="is_active" id="is_active" class="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-600">
           <label for="is_active" class="font-medium text-zinc-900 dark:text-zinc-100">Publicar imediatamente</label>
        </div>

      </form>
    </div>
  `
})
export class BundleEditorComponent {
  private bundleService = inject(BundleService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  isEditMode = signal(false);
  isSaving = signal(false);
  
  // Model state
  model: any = {
    title: '',
    week_number: 1,
    author: 'Lamed',
    description: '',
    resources: [],
    is_active: false
  };
  
  videoUrl = '';

  constructor() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEditMode.set(true);
        this.bundleService.getBundleById(id).subscribe(data => {
            this.model = { ...data };
            if (data.video_data) {
                this.videoUrl = data.video_data.url;
            }
        });
      }
    });
  }

  save() {
    this.isSaving.set(true);
    
    // Map video url back to object
    if (this.videoUrl) {
        this.model.video_data = {
            url: this.videoUrl,
            provider: 'youtube',
            duration: 0
        };
    }

    const request$ = this.isEditMode()
        ? this.bundleService.updateBundle(this.model.id, this.model)
        : this.bundleService.createBundle(this.model);

    request$.subscribe({
        next: (savedBundle) => {
            console.log('Bundle saved successfully', savedBundle);
            this.isSaving.set(false);
            this.router.navigate(['/admin']);
        },
        error: (err) => {
            console.error('Error saving bundle', err);
            this.isSaving.set(false);
            alert('Erro ao salvar. Verifique o console.');
        }
    });
  }
}
