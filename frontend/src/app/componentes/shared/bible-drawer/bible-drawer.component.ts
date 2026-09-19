// MARK: - Imports & Component Setup
import { Component, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { BibleService } from '../../../core/services/bible.service';

/**
 * Componente de Drawer lateral responsivo para exibição de versículos e capítulos bíblicos.
 * Permite alternar versões (NVI/AA), visualizar o capítulo completo e copiar passagens.
 */
@Component({
  selector: 'app-bible-drawer',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './bible-drawer.component.html',
  styleUrl: './bible-drawer.component.scss',
})
export class BibleDrawerComponent {
  // MARK: - Dependencies & State
  bibleService = inject(BibleService);

  // MARK: - Keyboard & Backdrop Listeners
  @HostListener('window:keydown.escape')
  onEscape(): void {
    if (this.bibleService.isOpen()) {
      this.bibleService.closeDrawer();
    }
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('bible-drawer-backdrop')) {
      this.bibleService.closeDrawer();
    }
  }

  // MARK: - UI Helpers
  /**
   * Determina se um versículo específico está dentro do range da passagem pesquisada.
   *
   * @param verseNumber Número do versículo a ser verificado.
   */
  isTargetVerse(verseNumber: number): boolean {
    const passage = this.bibleService.activePassage();
    if (!passage) return false;
    const start = passage.start_verse || 0;
    const end = passage.end_verse || start;
    return verseNumber >= start && verseNumber <= end;
  }
}

