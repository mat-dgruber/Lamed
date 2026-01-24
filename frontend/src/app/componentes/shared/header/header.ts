import { Component, HostListener, OnInit, ViewChild, ElementRef, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header implements OnInit {
  // State with Signals
  public isHeaderHidden = signal(false);
  public isMenuOpen = signal(false);
  public isDropdownOpen = signal(false);

  private scrollThreshold = 400;
  private lastScrollY = 0;
  private dropdownTimer: any;
  private router = inject(Router);

  @ViewChild('dropdown') dropdownRef!: ElementRef;
  @ViewChild('dropdownMenu') dropdownMenuRef!: ElementRef;

  public toggleMenu(): void {
    this.isMenuOpen.update(v => !v);
  }

  public closeMenu(): void {
    this.isMenuOpen.set(false);
    this.isDropdownOpen.set(false);
  }

  public toggleDropdown(event: MouseEvent): void {
    event.stopPropagation();
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      this.isDropdownOpen.update(v => !v);
    }
  }

  onMouseEnter() {
    clearTimeout(this.dropdownTimer);
    this.isDropdownOpen.set(true);
  }

  onMouseLeave() {
    this.dropdownTimer = setTimeout(() => {
      this.isDropdownOpen.set(false);
    }, 300);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (
      this.dropdownRef?.nativeElement.contains(event.target)
    ) {
      return;
    }
    
    if (
      this.dropdownMenuRef &&
      !this.dropdownMenuRef.nativeElement.contains(event.target)
    ) {
      this.isDropdownOpen.set(false);
    }
  }

  ngOnInit() {
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.setScrollThreshold(event.urlAfterRedirects);
    });
    this.setScrollThreshold(this.router.url);
  }

  private setScrollThreshold(url: string) {
    if (url.includes('/videos')) {
      this.scrollThreshold = 90;
    } else if (url.includes('/doacao')) {
      this.scrollThreshold = 80;
    } else if (url.includes('/artigos')) {
      this.scrollThreshold = 50;
    } else if (url.includes('/sobre')) {
      this.scrollThreshold = 100;
    } else if (url.includes('/politica') || url.includes('/termos')) {
      this.scrollThreshold = 150;
    } else { // Index page
      this.scrollThreshold = 200;
    }
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const currentScrollY = window.scrollY;
    
    // Simple logic: Hide if scrolled down past threshold, show if at top
    // The original logic was: > threshold -> hidden. else -> visible.
    this.isHeaderHidden.set(currentScrollY > this.scrollThreshold);
    
    this.lastScrollY = currentScrollY;
  }
}
