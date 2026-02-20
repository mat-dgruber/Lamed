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
  styleUrl: './dashboard.component.scss',
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
    this.bundleService.syncWithYouTube().subscribe({
      next: (res) => {
        this.isSyncing = false;
        if (res && res.data) {
          const imported = res.data.imported || 0;
          const errors = res.data.errors || 0;
          alert(`Sincronização concluída!\nImportados: ${imported}\nErros: ${errors}`);
          // Refresh list
          this.bundleService.getBundles(50, 0, false).subscribe();
        } else {
          alert('Sincronização concluída.');
        }
      },
      error: (err) => {
        this.isSyncing = false;
        console.error(err);
        alert('Erro ao sincronizar vídeos. Veja o console para detalhes.');
      },
    });
  }

  deleteBundle(id: string) {
    if (confirm('Tem certeza que deseja excluir este bundle?')) {
      this.bundleService.deleteBundle(id).subscribe({
        next: () => {
          // Optimistic update or refresh
          this.bundleService.getBundles(50, 0, false).subscribe();
        },
        error: (err) => {
          console.error('Error deleting bundle:', err);
          alert('Erro ao excluir bundle.');
        },
      });
    }
  }
}
