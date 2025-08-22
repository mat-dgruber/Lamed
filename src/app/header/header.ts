import { Component, HostListener, OnInit } from '@angular/core';
import { Router, NavigationEnd, RouterLink } from '@angular/router';
import { NgClass } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, LucideAngularModule, NgClass],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class Header implements OnInit {
  isHeaderHidden = false;
  private scrollThreshold = 400;

  constructor(private router: Router) {}

  ngOnInit() {
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      const path = event.urlAfterRedirects;
      if (path.endsWith('/videos')) {
        this.scrollThreshold = 90;
      } else if (path.endsWith('/apoie')) {
        this.scrollThreshold = 80;
      } else if (path.endsWith('/artigos')) {
        this.scrollThreshold = 50;
      } else if (path.endsWith('/sobre')) {
        this.scrollThreshold = 100;
      } else if (path.endsWith('/politica-de-privacidade') || path.endsWith('/termos-de-uso')) {
        this.scrollThreshold = 150;
      } else if (path === '/' || path.endsWith('/inicio')) {
        this.scrollThreshold = 200;
      } else {
        this.scrollThreshold = 400; // Default
      }
    });
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (window.scrollY > this.scrollThreshold) {
      this.isHeaderHidden = true;
    } else {
      this.isHeaderHidden = false;
    }
  }
}