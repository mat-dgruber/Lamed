//footer.ts
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
    const scrollThreshold = 300;
    this.isButtonVisible = yOffset > scrollThreshold;
  }

  public scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  handleEmailClick(event: MouseEvent) {
    event.preventDefault(); // Impede o comportamento padrão do link
    const email = 'lamedchanel@gmail.com';

    // Cria um link temporário para tentar a abertura do mailto
    const mailtoLink = document.createElement('a');
    mailtoLink.href = `mailto:${email}`;
    document.body.appendChild(mailtoLink);
    mailtoLink.click();
    document.body.removeChild(mailtoLink);

    // Usa um pequeno atraso para dar tempo ao navegador de tentar a ação
    setTimeout(() => {
        // Se o e-mail não foi aberto (por exemplo, a página ainda está focada)
        // Isso é uma verificação simples, mas funcional para a maioria dos casos
        if (this.document.hasFocus()) {
            // Tenta copiar para a área de transferência como um fallback
            navigator.clipboard.writeText(email).then(() => {
                this.copyStatusMessage = 'E-mail copiado para a área de transferência!';
                setTimeout(() => {
                    this.copyStatusMessage = null;
                }, 3000);
            }).catch(err => {
                console.error('Falha ao copiar e-mail: ', err);
                this.copyStatusMessage = 'Falha ao copiar o e-mail.';
                setTimeout(() => {
                    this.copyStatusMessage = null;
                }, 3000);
            });
        }
    }, 100); // Um atraso menor, 100ms, é geralmente suficiente.
  }
}