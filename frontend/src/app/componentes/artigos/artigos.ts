import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { ArticleService, Article } from '../../services/article.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-artigos',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, LucideAngularModule],
  templateUrl: './artigos.html',
  styleUrl: './artigos.scss',
})
export class Artigos {
  private articleService = inject(ArticleService);

  // Load articles
  articles = toSignal(this.articleService.getArticles(), { initialValue: [] });
  
  // Search Control
  searchControl = new FormControl('');
  searchTerm = toSignal(
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ),
    { initialValue: '' }
  );

  // Latest Article
  latestArticle = computed(() => {
    const all = this.articles();
    return all.length > 0 ? all[0] : null;
  });

  // Toggles
  showAll = signal(false);

  // Filtered Articles (Base)
  // We exclude the first one IF it's the latest (highlighted), BUT only if we are NOT searching?
  // Actually, the original logic said: "Exclude the latest one... if there is no search term".
  // Let's keep that logic.
  baseArticles = computed(() => {
    const term = this.searchTerm()?.toLowerCase() || '';
    const all = this.articles();
    
    let list = all;
    
    if (term) {
        list = list.filter(a => 
            a.title.toLowerCase().includes(term) ||
            a.description.toLowerCase().includes(term) ||
            (a.author && a.author.toLowerCase().includes(term))
        );
        // If searching, we show ALL matches (including the latest if it matches)
        return list; 
    }
    
    // If NOT searching, exclude the first one (latest) as it is shown in Hero
    if (list.length > 0) {
        return list.slice(1);
    }
    
    return [];
  });

  // Initial List (First 6)
  initialArticles = computed(() => {
    return this.baseArticles().slice(0, 6);
  });

  // Remaining List (The rest)
  remainingArticles = computed(() => {
    return this.baseArticles().slice(6);
  });

  toggleShowAll() {
    this.showAll.update(v => !v);
  }
}
