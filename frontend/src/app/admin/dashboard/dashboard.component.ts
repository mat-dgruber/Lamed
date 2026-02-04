import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { BundleService, Bundle } from '../../services/bundle.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class AdminDashboardComponent {
  private bundleService = inject(BundleService);
  bundles = this.bundleService.bundles;
  isSyncing = false;

  constructor() {
    this.bundleService.getBundles(50, 0, false).subscribe();
  }

  syncVideos() {
    this.isSyncing = true;
    this.bundleService.syncVideosFromAssets().subscribe({
      next: (results) => {
        this.isSyncing = false;
        if (results && results.length > 0) {
          alert(`Sincronização concluída! ${results.length} novos bundles criados.`);
        } else {
          alert('Nenhum vídeo novo encontrado para sincronizar.');
        }
      },
      error: (err) => {
        this.isSyncing = false;
        console.error(err);
        alert('Erro ao sincronizar vídeos. Verifique o console.');
      }
    });
  }
}
