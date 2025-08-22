import { Component } from '@angular/core';
import { Router } from '@angular/router'; // Import Router
import { DonationChartsComponent } from '../components/donation-charts/donation-charts.component';

@Component({
  selector: 'app-apoie',
  standalone: true,
  imports: [DonationChartsComponent],
  templateUrl: './apoie.html',
})
export class Apoie {

  constructor(private router: Router) {} // Inject Router

  navigateToSobre(): void {
    this.router.navigate(['/sobre']); // Navigate to /sobre
  }
}
