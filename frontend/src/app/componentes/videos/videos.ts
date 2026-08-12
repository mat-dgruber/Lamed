import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VideosService } from '../../services/videos.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { SeoService } from '../../core/services/seo.service';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-videos',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './videos.html',
  styleUrl: './videos.scss',
})
export class Videos implements OnInit {
  private videosService = inject(VideosService);
  private sanitizer = inject(DomSanitizer);
  private seo = inject(SeoService);
  private router = inject(Router);

  activeTab = signal<'long' | 'shorts'>('long');
  videos$ = this.videosService.getVideos(false);
  playingVideoIds = signal<Set<string>>(new Set());

  setTab(tab: 'long' | 'shorts'): void {
    if (this.activeTab() === tab) return;
    this.activeTab.set(tab);
    this.playingVideoIds.set(new Set());
    this.videos$ = this.videosService.getVideos(tab === 'shorts');
  }

  ngOnInit(): void {
    this.seo.updateTags({
      title: 'Vídeos',
      description:
        'Assista aos estudos bíblicos em vídeo do Lamed. Conteúdo semanal para adolescentes, jovens e professores da Escola Sabatina.',
      imageUrl: 'assets/Imagens/Fundo_Lamed-total.png',
      url: this.router.url,
    });

    this.videosService.getVideos(false).subscribe((videos) => {
      this.seo.updateJsonLd({
        id: 'videos-list',
        data: {
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: 'Vídeos do Lamed',
          itemListElement: videos.map((v: any, index: number) => ({
            '@type': 'VideoObject',
            position: index + 1,
            name: v.snippet?.title ?? `Vídeo ${index + 1}`,
            url: v.id?.videoId ? `https://www.youtube.com/watch?v=${v.id.videoId}` : undefined,
            thumbnailUrl: v.snippet?.thumbnails?.high?.url || (v.id?.videoId ? `https://img.youtube.com/vi/${v.id.videoId}/hqdefault.jpg` : undefined),
            uploadDate: v.snippet?.publishedAt,
          })),
        },
      });
    });
  }

  playVideo(videoId: string): void {
    this.playingVideoIds.update((set) => {
      const next = new Set(set);
      next.add(videoId);
      return next;
    });
  }

  isPlaying(videoId: string): boolean {
    return this.playingVideoIds().has(videoId);
  }

  getSafeUrl(videoId: string): SafeResourceUrl {
    const url = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  getThumbnailUrl(videoId: string, customThumbUrl?: string): string {
    if (customThumbUrl) return customThumbUrl;
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  }
}
