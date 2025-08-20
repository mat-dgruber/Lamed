import { Component } from '@angular/core';
import { RouterLink } from '@angular/router'; // <-- Import RouterLink
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-footer',
  standalone: true,
  // Update the imports array
  imports: [RouterLink, LucideAngularModule],
  templateUrl: './footer.html',
  styleUrl: './footer.css'
})
// Rename the class
export class Footer { 
  currentYear = new Date().getFullYear();
}