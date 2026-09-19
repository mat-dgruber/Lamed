import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface BibleVerse {
  number: number;
  text: string;
}

export interface BiblePassage {
  book: string;
  abbrev: string;
  chapter: number;
  start_verse?: number;
  end_verse?: number;
  version: string;
  reference: string;
  text?: string;
  verses: BibleVerse[];
  total_verses?: number;
  total_verses_in_chapter?: number;
}

export interface BibleBookInfo {
  abbrev: string;
  name: string;
  total_chapters: number;
}

@Injectable({
  providedIn: 'root',
})
export class BibleService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // MARK: - Reactive Signals State
  activePassage = signal<BiblePassage | null>(null);
  chapterPassage = signal<BiblePassage | null>(null);
  isOpen = signal<boolean>(false);
  loading = signal<boolean>(false);
  loadingChapter = signal<boolean>(false);
  hasError = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  selectedVersion = signal<'nvi' | 'aa'>('nvi');
  viewMode = signal<'verse' | 'chapter'>('verse');
  copied = signal<boolean>(false);

  private memoryCache = new Map<string, BiblePassage>();

  // MARK: - Open / Close Drawer
  openVerse(ref: string, version?: 'nvi' | 'aa'): void {
    if (!ref || !ref.trim()) return;
    const cleanRef = ref.trim();
    const ver = version || this.selectedVersion();
    this.selectedVersion.set(ver);
    this.viewMode.set('verse');
    this.isOpen.set(true);
    this.hasError.set(false);
    this.errorMessage.set(null);

    const cacheKey = `verse_${ver}_${cleanRef.toLowerCase()}`;
    const cached = this.getFromCache(cacheKey);

    if (cached) {
      this.activePassage.set(cached);
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.http
      .get<BiblePassage>(`${this.apiUrl}/bible/verse`, {
        params: { ref: cleanRef, version: ver },
      })
      .pipe(
        tap((data) => {
          this.activePassage.set(data);
          this.saveToCache(cacheKey, data);
          this.loading.set(false);
        }),
        catchError((err) => {
          this.loading.set(false);
          this.hasError.set(true);
          const msg =
            err?.error?.detail ||
            `Não foi possível carregar a passagem "${cleanRef}". Verifique sua conexão.`;
          this.errorMessage.set(msg);
          return of(null);
        }),
      )
      .subscribe();
  }

  loadFullChapter(): void {
    const passage = this.activePassage();
    if (!passage) return;

    this.viewMode.set('chapter');
    const ver = this.selectedVersion();
    const cacheKey = `chapter_${ver}_${passage.abbrev}_${passage.chapter}`;
    const cached = this.getFromCache(cacheKey);

    if (cached) {
      this.chapterPassage.set(cached);
      this.loadingChapter.set(false);
      return;
    }

    this.loadingChapter.set(true);
    this.http
      .get<BiblePassage>(`${this.apiUrl}/bible/chapter`, {
        params: {
          book: passage.abbrev,
          chapter: passage.chapter.toString(),
          version: ver,
        },
      })
      .pipe(
        tap((data) => {
          this.chapterPassage.set(data);
          this.saveToCache(cacheKey, data);
          this.loadingChapter.set(false);
        }),
        catchError((err) => {
          this.loadingChapter.set(false);
          return of(null);
        }),
      )
      .subscribe();
  }

  switchVersion(ver: 'nvi' | 'aa'): void {
    if (this.selectedVersion() === ver) return;
    this.selectedVersion.set(ver);
    const passage = this.activePassage();
    if (passage) {
      this.openVerse(passage.reference, ver);
      if (this.viewMode() === 'chapter') {
        this.chapterPassage.set(null);
        this.loadFullChapter();
      }
    }
  }

  setViewMode(mode: 'verse' | 'chapter'): void {
    if (mode === 'chapter' && !this.chapterPassage()) {
      this.loadFullChapter();
    } else {
      this.viewMode.set(mode);
    }
  }

  closeDrawer(): void {
    this.isOpen.set(false);
  }

  copyPassage(): void {
    const passage =
      this.viewMode() === 'verse'
        ? this.activePassage()
        : this.chapterPassage() || this.activePassage();

    if (!passage) return;

    let formattedText = `"${passage.text}"`;
    if (this.viewMode() === 'chapter' && passage.verses) {
      formattedText = passage.verses
        .map((v) => `[${v.number}] ${v.text}`)
        .join('\n');
    }

    const payload = `${formattedText}\n— ${passage.reference} (${passage.version})`;

    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(payload).then(() => {
        this.copied.set(true);
        setTimeout(() => this.copied.set(false), 2200);
      });
    }
  }

  // MARK: - Cache Helpers
  private getFromCache(key: string): BiblePassage | null {
    if (this.memoryCache.has(key)) {
      return this.memoryCache.get(key)!;
    }
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = localStorage.getItem(`lamed_bible_${key}`);
        if (raw) {
          const parsed = JSON.parse(raw) as BiblePassage;
          this.memoryCache.set(key, parsed);
          return parsed;
        }
      }
    } catch {
      // Fallback gracioso caso localStorage esteja restrito
    }
    return null;
  }

  private saveToCache(key: string, data: BiblePassage): void {
    this.memoryCache.set(key, data);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(`lamed_bible_${key}`, JSON.stringify(data));
      }
    } catch {
      // Ignora erro de quota ou restrição
    }
  }
}
