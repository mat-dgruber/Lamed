import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { VideoService } from '../../services/video.service';
import { ArticleService } from '../../services/article.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { MetaTagService } from '../../services/meta-tag.service';

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

  showHeroText1 = true;
  heroText1Opacity = 1;
  showHeroText2 = false;
  heroText2Opacity = 0;

  constructor(
    private videoService: VideoService,
    private articleService: ArticleService,
    private sanitizer: DomSanitizer,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private metaTagService: MetaTagService
  ) { }

  navigateToApoie(): void {
    this.router.navigate(['/apoie']);
  }

  ngOnInit(): void {
    this.metaTagService.updateDefaultTags();
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

    // Hero text animation logic
    setTimeout(() => {
      this.heroText1Opacity = 0;
      this.cdr.markForCheck();
      setTimeout(() => {
        this.showHeroText1 = false;
        this.showHeroText2 = true;
        this.cdr.markForCheck();
        // A small delay to ensure the element is in the DOM before animating opacity
        setTimeout(() => {
          this.heroText2Opacity = 1;
          this.cdr.markForCheck();
        }, 100);
      }, 500); // This should match the CSS transition duration for the fade-out
    }, 1800); // 3-second initial delay
  }
}
