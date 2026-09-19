import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { BundleService, Bundle } from '../../services/bundle.service';
import {
  AdminAnalyticsService,
  AnalyticsSummary,
  RealtimeAnalytics,
  TopContentItem,
  TrafficSourceItem,
} from '../../services/admin-analytics.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, LucideAngularModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class AdminDashboardComponent implements OnInit {
  private bundleService = inject(BundleService);
  private analyticsService = inject(AdminAnalyticsService);

  bundles = signal<Bundle[]>([]);
  loading = signal<boolean>(true);
  isSyncing = false;

  currentPage = signal<number>(1);
  pageHistory = signal<string[]>([]);
  hasNextPage = signal<boolean>(false);
  pageSize = 10;

  // Filtros e Busca instantânea
  searchTerm = signal<string>('');
  statusFilter = signal<'all' | 'active' | 'draft'>('all');

  // Modal seguro de exclusão
  bundleToDelete = signal<Bundle | null>(null);
  isDeleting = signal<boolean>(false);

  // Status toggle rápido
  togglingStatusId = signal<string | null>(null);

  // Feedback Toast
  toast = signal<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Google Analytics State
  analyticsOverview = signal<AnalyticsSummary | null>(null);
  realtimeAnalytics = signal<RealtimeAnalytics | null>(null);
  topContent = signal<TopContentItem[]>([]);
  trafficSources = signal<TrafficSourceItem[]>([]);
  analyticsLoading = signal<boolean>(false);
  analyticsModalOpen = signal<boolean>(false);
  analyticsSetupOpen = signal<boolean>(false);

  constructor() {
    this.loadPage();
  }

  ngOnInit() {
    this.loadAnalytics();
  }

  loadAnalytics() {
    this.analyticsLoading.set(true);
    this.analyticsService.getOverview(30).subscribe({
      next: (data) => {
        this.analyticsOverview.set(data);
        this.analyticsLoading.set(false);
      },
      error: () => this.analyticsLoading.set(false),
    });

    this.analyticsService.getRealtime().subscribe({
      next: (data) => this.realtimeAnalytics.set(data),
    });

    this.analyticsService.getTopContent(5, 30).subscribe({
      next: (data) => this.topContent.set(data),
    });

    this.analyticsService.getTrafficSources(30).subscribe({
      next: (data) => this.trafficSources.set(data),
    });
  }

  loadPage() {
    this.loading.set(true);
    const startAfterId =
      this.currentPage() > 1 ? this.pageHistory()[this.currentPage() - 2] : undefined;
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
        this.showToast('Erro ao carregar os bundles.', 'error');
        this.loading.set(false);
      },
    });
  }

  getCurrentWeekNumber(): number {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  }

  currentWeekBundle = computed<Bundle | undefined>(() => {
    const currWeek = this.getCurrentWeekNumber();
    const list = this.bundles();
    return list.find((b) => b.week_number === currWeek) || list.find((b) => b.is_active);
  });

  // Métricas e KPIs
  stats = computed(() => {
    const list = this.bundles();
    const total = list.length;
    const active = list.filter((b) => b.is_active).length;
    const draft = total - active;

    const curr = this.currentWeekBundle();
    let readinessScore = 0;
    if (curr) {
      if (curr.video_id) readinessScore += 25;
      if (curr.resources && curr.resources.length > 0) readinessScore += 25;
      if (curr.is_active) readinessScore += 25;
      if (curr.article_url || curr.article_content) readinessScore += 25;
    }

    return { total, active, draft, readinessScore };
  });

  // Lista filtrada reativamente
  filteredBundles = computed(() => {
    const list = this.bundles();
    const term = this.searchTerm().trim().toLowerCase();
    const filter = this.statusFilter();

    return list.filter((item) => {
      // Filtro de status
      if (filter === 'active' && !item.is_active) return false;
      if (filter === 'draft' && item.is_active) return false;

      // Filtro de busca
      if (!term) return true;

      const titleMatch = item.title?.toLowerCase().includes(term);
      const descMatch = item.description?.toLowerCase().includes(term);
      const weekMatch =
        item.week_number?.toString() === term ||
        `#${item.week_number}`.toLowerCase() === term ||
        `semana ${item.week_number}`.toLowerCase().includes(term);

      return titleMatch || descMatch || weekMatch;
    });
  });

  clearSearch() {
    this.searchTerm.set('');
  }

  setStatusFilter(filter: 'all' | 'active' | 'draft') {
    this.statusFilter.set(filter);
  }

  nextPage() {
    if (!this.hasNextPage()) return;
    const currentList = this.bundles();
    if (currentList.length === 0) return;
    const lastItemId = currentList[currentList.length - 1].id;

    this.pageHistory.update((history) => [...history, lastItemId]);
    this.currentPage.update((p) => p + 1);
    this.loadPage();
  }

  prevPage() {
    if (this.currentPage() <= 1) return;
    this.currentPage.update((p) => p - 1);
    this.pageHistory.update((history) => history.slice(0, -1));
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
          this.showToast(
            `Sincronização concluída! ${imported} importado(s), ${errors} erro(s).`,
            'success'
          );
          this.loadPage();
        } else {
          this.showToast('Sincronização concluída com sucesso.', 'success');
        }
      },
      error: (err) => {
        this.isSyncing = false;
        console.error('Sync error:', err);
        this.showToast('Erro ao sincronizar vídeos do YouTube.', 'error');
      },
    });
  }

  // Alterna o status Publicado / Rascunho diretamente
  toggleStatus(bundle: Bundle) {
    this.togglingStatusId.set(bundle.id);
    const newStatus = !bundle.is_active;

    this.bundleService.updateBundle(bundle.id, { is_active: newStatus }).subscribe({
      next: () => {
        this.togglingStatusId.set(null);
        this.bundles.update((list) =>
          list.map((b) => (b.id === bundle.id ? { ...b, is_active: newStatus } : b))
        );
        this.showToast(
          newStatus
            ? `Bundle #${bundle.week_number} publicado no site.`
            : `Bundle #${bundle.week_number} alterado para rascunho.`,
          'success'
        );
      },
      error: (err) => {
        this.togglingStatusId.set(null);
        console.error('Error toggling status:', err);
        this.showToast('Erro ao atualizar status do bundle.', 'error');
      },
    });
  }

  // Fluxo de Confirmação Segura de Exclusão
  confirmDelete(bundle: Bundle) {
    this.bundleToDelete.set(bundle);
  }

  cancelDelete() {
    this.bundleToDelete.set(null);
  }

  setAsDraftFromModal() {
    const bundle = this.bundleToDelete();
    if (!bundle) return;

    this.isDeleting.set(true);
    this.bundleService.updateBundle(bundle.id, { is_active: false }).subscribe({
      next: () => {
        this.isDeleting.set(false);
        this.bundleToDelete.set(null);
        this.bundles.update((list) =>
          list.map((b) => (b.id === bundle.id ? { ...b, is_active: false } : b))
        );
        this.showToast(`Bundle #${bundle.week_number} desativado e mantido em rascunho.`, 'info');
      },
      error: (err) => {
        this.isDeleting.set(false);
        console.error('Error setting bundle as draft:', err);
        this.showToast('Erro ao alterar status para rascunho.', 'error');
      },
    });
  }

  executeDelete() {
    const bundle = this.bundleToDelete();
    if (!bundle) return;

    this.isDeleting.set(true);
    this.bundleService.deleteBundle(bundle.id).subscribe({
      next: () => {
        this.isDeleting.set(false);
        this.bundleToDelete.set(null);
        this.showToast(`Bundle #${bundle.week_number} excluído com sucesso.`, 'success');
        this.loadPage();
      },
      error: (err) => {
        this.isDeleting.set(false);
        console.error('Error deleting bundle:', err);
        this.showToast('Erro ao excluir o bundle.', 'error');
      },
    });
  }

  // Analytics Modals
  openAnalyticsModal() {
    this.analyticsModalOpen.set(true);
  }

  closeAnalyticsModal() {
    this.analyticsModalOpen.set(false);
  }

  openAnalyticsSetup() {
    this.analyticsSetupOpen.set(true);
  }

  closeAnalyticsSetup() {
    this.analyticsSetupOpen.set(false);
  }

  formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs.toString().padStart(2, '0')}s`;
  }

  private showToast(message: string, type: 'success' | 'info' | 'error') {
    this.toast.set({ message, type });
    setTimeout(() => {
      this.toast.set(null);
    }, 4500);
  }
}
