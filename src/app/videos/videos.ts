import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VideoService } from '../services/video.service';
import { Observable } from 'rxjs';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-videos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './videos.html',
  styleUrls: ['./videos.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Videos implements OnInit {
  videos$!: Observable<any[]>;

  constructor(
    private videoService: VideoService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this.videos$ = this.videoService.getVideos();
  }

  getSafeUrl(videoId: string): SafeResourceUrl {
    const url = `https://www.youtube-nocookie.com/embed/${videoId}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
