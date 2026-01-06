import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MetaTagService } from '../../services/meta-tag.service';
import { Router } from '@angular/router';
import { BundleService, LessonBundle } from '../../services/bundle.service';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-guia-de-estudos',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, TooltipModule],
  templateUrl: './guia-de-estudos.html',
  styleUrls: ['./guia-de-estudos.css']
})
export class GuiaDeEstudos implements OnInit {
  private metaTagService = inject(MetaTagService);
  private router = inject(Router);
  private bundleService = inject(BundleService);

  bundles: LessonBundle[] = [];
  latestBundle: LessonBundle | null = null;
  
  // Pagination
  allPreviousBundles: LessonBundle[] = [];
  visibleBundles: LessonBundle[] = [];
  itemsToShow = 3;

  ngOnInit(): void {
    this.metaTagService.updateTags(
      'Materiais Extras',
      'Baixe os kits completos de estudo semanal.',
      'assets/Imagens/Fundo_Lamed-total.png',
      this.router.url
    );
    
    this.loadBundles();
  }

  loadBundles() {
      this.bundleService.getBundles().subscribe(data => {
          this.bundles = data; 
          if (this.bundles.length > 0) {
              this.latestBundle = this.bundles[0];
              this.allPreviousBundles = this.bundles.slice(1);
              this.updateVisibleBundles();
          }
      });
  }

  updateVisibleBundles() {
      this.visibleBundles = this.allPreviousBundles.slice(0, this.itemsToShow);
  }

  loadMore() {
      this.itemsToShow += 3;
      this.updateVisibleBundles();
  }

  getThumbnail(url?: string): string {
      if (!url) return 'assets/Imagens/Fundo_Lamed-total.png';
      // Extract Video ID
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      return (match && match[2].length === 11)
        ? `https://img.youtube.com/vi/${match[2]}/maxresdefault.jpg`
        : 'assets/Imagens/Fundo_Lamed-total.png';
  }
}
