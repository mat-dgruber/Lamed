import { Component, HostListener, OnInit, ViewChild, ElementRef } from '@angular/core';
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
  private lastScrollY = 0;
  public isMenuOpen = false;
  public isDropdownOpen = false;
  private dropdownTimer: any;

  @ViewChild('dropdown') dropdownRef!: ElementRef;
  @ViewChild('dropdownMenu') dropdownMenuRef!: ElementRef;

  constructor(private router: Router) {}

  public toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  public toggleDropdown(event: MouseEvent): void {
    event.stopPropagation();
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      this.isDropdownOpen = !this.isDropdownOpen;
    }
  }

  onMouseEnter() {
    clearTimeout(this.dropdownTimer);
    this.isDropdownOpen = true;
  }

  onMouseLeave() {
    this.dropdownTimer = setTimeout(() => {
      this.isDropdownOpen = false;
    }, 2000);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (
      this.dropdownRef &&
      this.dropdownRef.nativeElement.contains(event.target)
    ) {
      // Click is inside the dropdown toggle, let toggleDropdown handle it
      return;
    }
    
    if (
      this.dropdownMenuRef &&
      !this.dropdownMenuRef.nativeElement.contains(event.target)
    ) {
      // Click is outside the dropdown menu, close it
      this.isDropdownOpen = false;
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

    if (currentScrollY > this.scrollThreshold) {
      this.isHeaderHidden = true;
    } else {
      this.isHeaderHidden = false;
    }
    this.lastScrollY = currentScrollY;
  }
}