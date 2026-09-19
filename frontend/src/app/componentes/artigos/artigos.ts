import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { ArticleService, Article } from '../../services/article.service';
import { ArticleSearchService } from '../../services/article-search.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { GoogleDriveImagePipe } from '../../pipes/google-drive-image.pipe';

@Component({
  selector: 'app-artigos',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    LucideAngularModule,
    GoogleDriveImagePipe,
  ],
  templateUrl: './artigos.html',
  styleUrl: './artigos.scss',
})
export class Artigos {
  private articleService = inject(ArticleService);
  private articleSearchService = inject(ArticleSearchService);

  // Load articles
  articles = toSignal(this.articleService.getArticles());

  // Search Control
  searchControl = new FormControl('');
  searchTerm = toSignal(
    this.searchControl.valueChanges.pipe(debounceTime(250), distinctUntilChanged()),
    { initialValue: '' },
  );

  isSearching = computed(() => !!this.searchTerm()?.trim());

  // Latest Article
  latestArticle = computed(() => {
    const all = this.articles();
    return all && all.length > 0 ? all[0] : null;
  });

  // Popular thematic tags for quick discovery
  readonly popularTags = ['Oração', 'Fé', 'Saúde', 'Profecia', 'Família', 'Esperança'];
  activeTag = signal<string | null>(null);

  // Toggles
  showAll = signal(false);

  // Filtered Articles (Busca Híbrida Semântica / BM25 / RRF)
  baseArticles = computed(() => {
    const rawTerm = this.searchTerm()?.trim();
    const all = this.articles();

    if (!all) return [];

    if (rawTerm) {
      // 1. Busca Neural e Léxica Híbrida com RRF
      const searchResults = this.articleSearchService.searchArticles(rawTerm, all);
      if (searchResults.length > 0) {
        return searchResults.map((res) => res.item);
      }

      // 2. Fallback de correspondência por substring se pontuação for baixa
      const lowerTerm = rawTerm.toLowerCase();
      return all.filter(
        (a) =>
          a.title.toLowerCase().includes(lowerTerm) ||
          a.summary.toLowerCase().includes(lowerTerm) ||
          (a.author && a.author.toLowerCase().includes(lowerTerm)) ||
          (a.tags && a.tags.some((t) => t.toLowerCase().includes(lowerTerm))),
      );
    }

    // Se NÃO está pesquisando, exclui o primeiro (exibido no Destaque)
    if (all.length > 0) {
      return all.slice(1);
    }

    return [];
  });

  // Unified Visible Articles List (Clean single loop)
  visibleArticles = computed(() => {
    if (this.showAll() || this.isSearching()) {
      return this.baseArticles();
    }
    return this.baseArticles().slice(0, 6);
  });

  hasMoreArticles = computed(() => {
    return !this.showAll() && !this.isSearching() && this.baseArticles().length > 6;
  });

  remainingCount = computed(() => {
    return Math.max(0, this.baseArticles().length - 6);
  });

  // Backward compatibility for existing tests
  initialArticles = computed(() => {
    return this.baseArticles().slice(0, 6);
  });

  remainingArticles = computed(() => {
    return this.baseArticles().slice(6);
  });

  filterByTag(tag: string) {
    if (this.activeTag() === tag) {
      this.clearSearch();
    } else {
      this.activeTag.set(tag);
      this.searchControl.setValue(tag);
    }
  }

  getReadingTime(article: Article): number {
    const text = `${article.title || ''} ${article.summary || ''} ${article.content || ''}`;
    const words = text.replace(/<[^>]*>/g, ' ').trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(words / 180));
  }

  clearSearch() {
    this.activeTag.set(null);
    this.searchControl.setValue('');
  }

  toggleShowAll() {
    this.showAll.update((v) => !v);
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/Imagens/Fundo_Lamed-total.png';
  }
}
