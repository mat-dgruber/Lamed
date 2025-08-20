import { Component } from '@angular/core';
import { DonationChartsComponent } from '../components/donation-charts/donation-charts.component'; // <-- LINHA DE IMPORT

@Component({
  selector: 'app-apoie',
  standalone: true,
  imports: [DonationChartsComponent], // <-- IMPORT AQUI DENTRO
  templateUrl: './apoie.html',
})
export class Apoie {

}
