import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'; // Import Router
import { DonationChartsComponent } from '../components/donation-charts/donation-charts.component';
import { MetaTagService } from '../services/meta-tag.service';

@Component({
  selector: 'app-apoie',
  standalone: true,
  imports: [DonationChartsComponent],
  templateUrl: './apoie.html',
})
export class Apoie implements OnInit {

  constructor(private router: Router, private metaTagService: MetaTagService) {} // Inject Router

  ngOnInit(): void {
    this.metaTagService.updateTags(
      'Apoie o Lamed | Faça uma Doação',
      'Seu apoio é fundamental para continuarmos produzindo materiais de estudo da Bíblia. Considere fazer uma doação para o ministério Lamed.',
      'assets/Imagens/Fundo_Lamed-total.png',
      this.router.url
    );
  }

  navigateToSobre(): void {
    this.router.navigate(['/sobre']); // Navigate to /sobre
  }
}
