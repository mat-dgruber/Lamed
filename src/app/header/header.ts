import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgClass } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { HeaderVisibilityService } from '../../services/header-visibility.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, LucideAngularModule, NgClass],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class Header implements OnInit, OnDestroy {
  isHeaderHidden = false;
  private scrollThreshold = 200; // Consistent threshold for all pages
  private visibilitySubscription: Subscription;

  constructor(private headerVisibilityService: HeaderVisibilityService) {}

  ngOnInit() {
    this.visibilitySubscription = this.headerVisibilityService.headerVisible$.subscribe(
      isVisible => {
        this.isHeaderHidden = !isVisible;
      }
    );
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const isVisible = window.scrollY <= this.scrollThreshold;
    this.headerVisibilityService.setHeaderVisibility(isVisible);
  }

  ngOnDestroy() {
    if (this.visibilitySubscription) {
      this.visibilitySubscription.unsubscribe();
    }
  }
}