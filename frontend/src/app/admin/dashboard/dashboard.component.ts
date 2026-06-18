import { Component, inject, signal } from '@angular/core';
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
  
  bundles = signal<Bundle[]>([]);
  loading = signal<boolean>(true);
  isSyncing = false;

  currentPage = signal<number>(1);
  pageHistory = signal<string[]>([]); // stack of startAfterIds
  hasNextPage = signal<boolean>(false);
  pageSize = 10;

  constructor() {
    this.loadPage();
  }

  loadPage() {
    this.loading.set(true);
    const startAfterId = this.currentPage() > 1 ? this.pageHistory()[this.currentPage() - 2] : undefined;
    const fetchLimit = this.pageSize + 1;

    this.bundleService.getBundles(fetchLimit, startAfterId, false).subscribe({
      next: (data) => {
        if (data.length > this.pageSize) {
          this.hasNextPage.set(true);
          this.bundles.set(data.slice(0, this.pageSize));
        } else {
          this.hasNextPage.set(false);
          this.bundles.set(data);
        }
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading admin bundles:', err);
        this.loading.set(false);
      }
    });
  }

  nextPage() {
    if (!this.hasNextPage()) return;
    const currentList = this.bundles();
    if (currentList.length === 0) return;
    const lastItemId = currentList[currentList.length - 1].id;

    this.pageHistory.update(history => [...history, lastItemId]);
    this.currentPage.update(p => p + 1);
    this.loadPage();
  }

  prevPage() {
    if (this.currentPage() <= 1) return;
    this.currentPage.update(p => p - 1);
    this.pageHistory.update(history => history.slice(0, -1));
    this.loadPage();
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
          this.loadPage();
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
          this.loadPage();
        },
        error: (err) => {
          console.error('Error deleting bundle:', err);
          alert('Erro ao excluir bundle.');
        },
      });
    }
  }
}
