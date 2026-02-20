import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, PlayCircle, FileText, Download, FileSpreadsheet, Music, Image as ImageIcon } from 'lucide-angular';
import { Bundle } from '../../../services/bundle.service';
import { GoogleDriveImagePipe } from '../../../pipes/google-drive-image.pipe';

@Component({
  selector: 'app-bundle-card',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule, GoogleDriveImagePipe],
  template: `
    <div class="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition-all hover:shadow-lg border border-zinc-200"
         [class.h-full]="true">
      
      <!-- Video Thumbnail -->
      <div class="relative aspect-video w-full overflow-hidden bg-zinc-100">
        <img 
          [src]="bundle.thumbnail_url | googleDriveImage" 
          [alt]="bundle.title"
          class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          (error)="onImageError($event)"
        />
        <div class="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover:opacity-100">
          <lucide-icon [name]="'play-circle'" [size]="48" class="text-white drop-shadow-lg"></lucide-icon>
        </div>
        
      </div>

       <!-- Content -->
      <div class="flex flex-1 flex-col p-5">
        <div class="flex items-center gap-2 mb-2">
           <span class="inline-flex items-center rounded-full bg-orange-50 px-2 py-1 text-xs font-medium text-orange-700 ring-1 ring-inset ring-orange-700/10">
             Semana {{ bundle.week_number }}
           </span>
           <span class="text-xs text-zinc-500" *ngIf="bundle.published_at">
             {{ bundle.published_at | date:'mediumDate' }}
           </span>
        </div>

        <h3 class="mb-2 font-bold leading-tight text-zinc-900 group-hover:text-orange-600"
            [class.text-xl]="!compact" [class.text-lg]="compact">
          <a [routerLink]="['/bundle', bundle.id]" class="focus:outline-none">
            <span class="absolute inset-0" aria-hidden="true"></span>
            {{ bundle.title }}
          </a>
        </h3>

        <!-- Description (Hidden in Compact) -->
        <p class="mb-4 line-clamp-3 flex-1 text-sm text-zinc-600" *ngIf="!compact">
          {{ bundle.description }}
        </p>

        <!-- Actions Footer (Hidden in Compact unless we want 'Ver Mais') -->
        <div class="mt-auto flex items-center justify-between border-t border-zinc-100 pt-4" *ngIf="!compact">
          <div class="flex items-center gap-4 text-sm font-medium text-zinc-600">
            <div class="flex items-center gap-1 hover:text-orange-600">
              <lucide-icon [name]="'file-text'" [size]="16"></lucide-icon>
              <span>Artigo</span>
            </div>
            <div class="flex items-center gap-1 hover:text-green-600" *ngIf="bundle.resources.length > 0">
              <lucide-icon [name]="'download'" [size]="16"></lucide-icon>
              <span>{{ bundle.resources.length }} Arquivos</span>
            </div>
          </div>
        </div>
        
        <!-- Compact Footer -->
        <div class="mt-auto pt-2" *ngIf="compact">
            <span class="text-sm font-medium text-orange-600 group-hover:text-orange-500">Ver mais &rarr;</span>
        </div>

      </div>
    </div>
  `,
  styles: []
})
export class BundleCardComponent {
  @Input({ required: true }) bundle!: Bundle;
  @Input() compact = false;

  formatDuration(seconds: number): string {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/Imagens/Fundo_Lamed-total.png';
  }
}
