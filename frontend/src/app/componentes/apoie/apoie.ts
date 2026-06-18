import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DonationChartsComponent } from '../../componentes/donation-charts/donation-charts.component';
import { MetaTagsService } from '../../services/meta-tags.service';

type CopyStatus = 'idle' | 'copied' | 'error';

@Component({
  selector: 'app-apoie',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DonationChartsComponent],
  templateUrl: './apoie.html',
  styleUrl: './apoie.scss'
})
export class Apoie implements OnInit {
  private readonly metaTagService = inject(MetaTagsService);
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

  goHome(): void {
    void this.router.navigate(['/']);
  }
}
