import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { VideoService } from '../services/video.service';
import { ArticleService } from '../services/article.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Home implements OnInit {
  latestVideo$!: Observable<any>;
  latestArticle$!: Observable<any>;
  featuredVideoUrl$!: Observable<SafeResourceUrl | undefined>;

  constructor(
    private videoService: VideoService,
    private articleService: ArticleService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this.latestVideo$ = this.videoService.getLatestVideo();
    this.latestArticle$ = this.articleService.getLatestArticle();

    this.featuredVideoUrl$ = this.latestVideo$.pipe(
      map(video => {
        if (video) {
          const videoUrl = `https://www.youtube.com/embed/${video.id.videoId}`;
          return this.sanitizer.bypassSecurityTrustResourceUrl(videoUrl);
        }
        return undefined;
      })
    );
  }
}
