import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { DonationChartsComponent } from '../../componentes/donation-charts/donation-charts.component';
import { MetaTagsService } from '../../services/meta-tags.service';

@Component({
  selector: 'app-apoie',
  standalone: true,
  imports: [DonationChartsComponent],
  templateUrl: './apoie.html',
  styleUrl: './apoie.scss'
})
export class Apoie implements OnInit {
  
  private router = inject(Router);
  private metaTagService = inject(MetaTagsService);

  ngOnInit(): void {
    this.metaTagService.updateTags(
      'Apoie o Lamed | Faça uma Doação',
      'Seu apoio é fundamental para continuarmos produzindo materiais de estudo da Bíblia. Considere fazer uma doação para o ministério Lamed.',
      'assets/Imagens/Fundo_Lamed-total.png',
      this.router.url
    );
  }

  navigateToSobre(): void {
    this.router.navigate(['/sobre']);
  }
}
