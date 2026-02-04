import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VideosService } from '../../services/videos.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';

@Component({
  selector: 'app-videos',
  standalone: true,
  imports: [CommonModule], // Importing CommonModule for AsyncPipe
  templateUrl: './videos.html',
  styleUrl: './videos.scss',
})
export class Videos {
  private videosService = inject(VideosService);
  private sanitizer = inject(DomSanitizer);

  videos$ = this.videosService.getVideos();

  getSafeUrl(videoId: string): SafeResourceUrl {
    const url = `https://www.youtube-nocookie.com/embed/${videoId}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
