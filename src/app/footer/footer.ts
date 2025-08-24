import { Component, HostListener, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, LucideAngularModule],
  templateUrl: './footer.html',
  styleUrl: './footer.css'
})
export class Footer {
  currentYear = new Date().getFullYear();
  isButtonVisible = false;

  constructor(@Inject(DOCUMENT) private document: Document) {}

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const yOffset = window.pageYOffset;
    const scrollThreshold = 300; // Show button after scrolling 300px
    this.isButtonVisible = yOffset > scrollThreshold;
  }

  scrollToTop() {
    this.document.documentElement.scrollTop = 0;
  }
}