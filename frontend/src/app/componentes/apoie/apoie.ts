import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { DonationChartsComponent } from '../../componentes/donation-charts/donation-charts.component';
import { SeoService } from '../../core/services/seo.service';

type CopyStatus = 'idle' | 'copied' | 'error';

@Component({
  selector: 'app-apoie',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DonationChartsComponent, LucideAngularModule],
  templateUrl: './apoie.html',
  styleUrl: './apoie.scss'
})
export class Apoie implements OnInit {
  private readonly metaTagService = inject(SeoService);
  private readonly router = inject(Router);

  readonly activeTab = signal<'cripto' | 'gift' | 'done'>('gift');
  readonly copyStatus = signal<CopyStatus>('idle');

  readonly pixKey = 'apeuportreamazonia@gmail.com';

  ngOnInit(): void {
    this.metaTagService.updateTags({
      title: 'Apoie o Lamed | Faça uma Doação',
      description:
        'Ajude o Lamed a continuar produzindo estudos bíblicos para adolescentes e jovens. Sua contribuição faz a diferença.',
      imageUrl: 'assets/Imagens/Fundo_Lamed-total.png',
      url: this.router.url
    });
  }

  selectTab(tab: 'cripto' | 'gift' | 'done'): void {
    this.activeTab.set(tab);
  }

  async copyPixKey(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.pixKey);
      this.copyStatus.set('copied');
      setTimeout(() => this.copyStatus.set('idle'), 3000);
    } catch {
      this.copyStatus.set('error');
      setTimeout(() => this.copyStatus.set('idle'), 3000);
    }
  }

  readonly shareCopied = signal(false);

  async shareContent(): Promise<void> {
    const shareData = {
      title: 'Lamed - Estudo Bíblico Aprofundado',
      text: 'Conheça o Lamed: onde você estuda a Bíblia de um jeito diferenciado!',
      url: 'https://www.youtube.com/channel/UC2PYvVmcJBLt9ymvBpnXO9A'
    };

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // Fallback to clipboard if share dialog is cancelled or unsupported
      }
    }

    try {
      await navigator.clipboard.writeText(shareData.url);
      this.shareCopied.set(true);
      setTimeout(() => this.shareCopied.set(false), 3000);
    } catch {
      // Graceful fallback
    }
  }

  navigateToSobre(): void {
    void this.router.navigate(['/sobre']);
  }
}
