import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BundleCardComponent } from '../shared/bundle-card/bundle-card.component';
import { BundleService } from '../../services/bundle.service';

@Component({
  selector: 'app-materiais-extras',
  standalone: true,
  imports: [CommonModule, BundleCardComponent],
  templateUrl: './materiais-extras.html',
  styleUrl: './materiais-extras.scss',
})
export class MateriaisExtras {
  private bundleService = inject(BundleService);
  bundles = this.bundleService.bundles;

  constructor() {
    this.bundleService.getBundles().subscribe();
  }
}
