import { Component, HostListener, Inject } from '@angular/core';
import { DOCUMENT, CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, LucideAngularModule, CommonModule],
  templateUrl: './footer.html',
  styleUrl: './footer.css'
})
export class Footer {
  currentYear = new Date().getFullYear();
  isButtonVisible = false;
  copyStatusMessage: string | null = null;

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

  handleEmailClick(event: MouseEvent) {
    const email = 'lamedchanel@gmail.com';
    
    // Immediately try to open the mailto link
    window.location.href = `mailto:${email}`;

    // Use a timeout to check if the mailto link was successful
    setTimeout(() => {
      if (!document.hasFocus()) {
        // The browser has likely switched to the mail client, so we do nothing.
        return;
      }

      // If the browser still has focus, the mailto link likely failed.
      // So, we copy the email to the clipboard as a fallback.
      navigator.clipboard.writeText(email).then(() => {
        this.copyStatusMessage = 'E-mail copiado para a área de transferência!';
        setTimeout(() => {
          this.copyStatusMessage = null;
        }, 3000); // Hide message after 3 seconds
      }).catch(err => {
        console.error('Falha ao copiar e-mail: ', err);
        this.copyStatusMessage = 'Falha ao copiar o e-mail.';
        setTimeout(() => {
          this.copyStatusMessage = null;
        }, 3000);
      });
    }, 500); // 500ms delay to allow the mail client to open
  }
}