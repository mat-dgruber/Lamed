import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { BundleService } from '../../services/bundle.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-artigos',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './artigos.html',
  styleUrl: './artigos.scss',
})
export class Artigos {
  private bundleService = inject(BundleService);

  // Load bundles
  bundles = this.bundleService.bundles;
  
  // Search Control
  searchControl = new FormControl('');
  searchTerm = toSignal(
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ),
    { initialValue: '' }
  );

  // Latest Article (Bundle)
  latestArticle = computed(() => {
    const all = this.bundles();
    return all.length > 0 ? all[0] : null;
  });

  // Filtered Articles (Bundles)
  filteredArticles = computed(() => {
    const term = this.searchTerm()?.toLowerCase() || '';
    const all = this.bundles();
    
    // If no search, return match all (excluding the latest if desired, but typically list all)
    // Let's exclude the featured one from the main list if needed, or follow backup logic?
    // Backup showed "Mais artigos" (More articles). 
    // Usually means skipping the first one. Let's filter.
    
    let list = all;
    
    if (term) {
        list = list.filter(b => 
            b.title.toLowerCase().includes(term) ||
            b.description.toLowerCase().includes(term) ||
            (b.author && b.author.toLowerCase().includes(term))
        );
    }
    
    // Exclude the latest one from the list if there is no search term (to replicate 'More articles')
    // If searching, show all matches.
    if (!term && list.length > 0) {
        return list.slice(1);
    }
    
    return list;
  });

  constructor() {
    this.bundleService.getBundles().subscribe();
  }
}
