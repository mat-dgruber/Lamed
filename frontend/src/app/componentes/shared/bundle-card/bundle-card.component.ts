import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, PlayCircle, FileText, Download, FileSpreadsheet, Music, Image as ImageIcon } from 'lucide-angular';
import { Bundle } from '../../../services/bundle.service';

@Component({
  selector: 'app-bundle-card',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule],
  template: `
    <div class="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition-all hover:shadow-lg dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
      
      <!-- Video Thumbnail -->
      <div class="relative aspect-video w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
        <img 
          [src]="bundle.thumbnail_url" 
          [alt]="bundle.title"
          class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div class="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover:opacity-100">
          <lucide-icon [name]="'play-circle'" [size]="48" class="text-white drop-shadow-lg"></lucide-icon>
        </div>
        
        <div class="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-1 text-xs font-medium text-white" *ngIf="bundle.video_data?.duration">
          {{ formatDuration(bundle.video_data!.duration!) }}
        </div>
      </div>

      <!-- Content -->
      <div class="flex flex-1 flex-col p-5">
        <div class="flex items-center gap-2 mb-2">
           <span class="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 dark:bg-blue-400/10 dark:text-blue-400">
             Semana {{ bundle.week_number }}
           </span>
           <span class="text-xs text-zinc-500" *ngIf="bundle.published_at">
             {{ bundle.published_at | date:'mediumDate' }}
           </span>
        </div>

        <h3 class="mb-2 text-xl font-bold leading-tight text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">
          <a [routerLink]="['/bundle', bundle.id]" class="focus:outline-none">
            <span class="absolute inset-0" aria-hidden="true"></span>
            {{ bundle.title }}
          </a>
        </h3>

        <p class="mb-4 line-clamp-3 flex-1 text-sm text-zinc-600 dark:text-zinc-400">
          {{ bundle.description }}
        </p>

        <!-- Actions Footer -->
        <div class="mt-auto flex items-center justify-between border-t border-zinc-100 pt-4 dark:border-zinc-800">
          <div class="flex items-center gap-4 text-sm font-medium text-zinc-600 dark:text-zinc-400">
            <div class="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400">
              <lucide-icon [name]="'file-text'" [size]="16"></lucide-icon>
              <span>Artigo</span>
            </div>
            <div class="flex items-center gap-1 hover:text-green-600 dark:hover:text-green-400" *ngIf="bundle.resources.length > 0">
              <lucide-icon [name]="'download'" [size]="16"></lucide-icon>
              <span>{{ bundle.resources.length }} Arquivos</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class BundleCardComponent {
  @Input({ required: true }) bundle!: Bundle;

  formatDuration(seconds: number): string {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  }
}
