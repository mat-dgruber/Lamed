import { Component, HostListener, inject, signal } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  LucideAngularModule,
  LucideIcons,
  LUCIDE_ICONS,
  Mail,
  Send,
  BadgeDollarSign,
  Youtube,
  Instagram,
  ArrowUpFromDot
} from 'lucide-angular';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    LucideAngularModule
  ],
  providers: [{
    provide: LUCIDE_ICONS,
    multi: true,
    useValue: {
      Mail,
      Send,
      BadgeDollarSign,
      Youtube,
      Instagram,
      ArrowUpFromDot
    }
  }],
  templateUrl: './footer.html',
  styleUrl: './footer.scss'
})
export class Footer {
  readonly currentYear = new Date().getFullYear();
  readonly isButtonVisible = signal(false);
  readonly copyStatusMessage = signal<string | null>(null);

  protected readonly icons = {
    Mail,
    Send,
    BadgeDollarSign,
    Youtube,
    Instagram,
    ArrowUpFromDot
  };

  private readonly document = inject(DOCUMENT);
  
  constructor() {}

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const yOffset = window.pageYOffset || this.document.documentElement.scrollTop;
    const scrollThreshold = 300;
    this.isButtonVisible.set(yOffset > scrollThreshold);
  }

  public scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Logic from BKP kept for reference, even if not explicitly bound in HTML right now
  handleEmailClick(event: MouseEvent) {
    event.preventDefault();
    const email = 'lamedchanel@gmail.com';

    // Try mailto
    const mailtoLink = this.document.createElement('a');
    mailtoLink.href = `mailto:${email}`;
    this.document.body.appendChild(mailtoLink);
    mailtoLink.click();
    this.document.body.removeChild(mailtoLink);

    setTimeout(() => {
        if (this.document.hasFocus()) {
            navigator.clipboard.writeText(email).then(() => {
                this.copyStatusMessage.set('E-mail copiado para a área de transferência!');
                setTimeout(() => {
                    this.copyStatusMessage.set(null);
                }, 3000);
            }).catch(err => {
                console.error('Falha ao copiar e-mail: ', err);
                this.copyStatusMessage.set('Falha ao copiar o e-mail.');
                setTimeout(() => {
                    this.copyStatusMessage.set(null);
                }, 3000);
            });
        }
    }, 100);
  }
}
