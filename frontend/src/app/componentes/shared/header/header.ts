// MARK: - Imports & Dependencies
import { Component, HostListener, OnInit, ViewChild, ElementRef, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterLink, RouterLinkActive } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { filter } from 'rxjs/operators';

// MARK: - Component Definition
/**
 * Componente de Cabeçalho e Navegação Global da plataforma Lamed.
 *
 * @remarks
 * Fornece uma arquitetura responsiva adaptativa:
 * - Em resoluções de desktop (>= 769px), renderiza menu horizontal com dropdown dinâmico de materiais.
 * - Em resoluções móveis (<= 768px), opera com cabeçalho limpo no topo, Bottom Navigation Bar ergonômica
 *   na base da tela (Thumb Zone) e gaveta modal deslizante (Bottom Sheet Drawer) com transições fluidas via GPU.
 */
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, LucideAngularModule],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header implements OnInit {
  // MARK: - Reactive State & Signals
  /** Sinal reativo que indica se o cabeçalho superior está ocultado durante a rolagem descendente. */
  public isHeaderHidden = signal(false);

  /** Sinal reativo que indica se o menu alternativo está aberto. */
  public isMenuOpen = signal(false);

  /** Sinal reativo de abertura do menu dropdown de materiais no desktop. */
  public isDropdownOpen = signal(false);

  /** Sinal reativo que controla o estado de visibilidade da gaveta móvel (Bottom Sheet Drawer). */
  public isBottomSheetOpen = signal(false);

  /** Sinal reativo que controla a expansão do accordion de materiais dentro da Bottom Sheet móvel. */
  public isAccordionOpen = signal(false);

  // MARK: - Scroll & Timing Configuration
  /** Limiar de rolagem em pixels para ocultar suavemente o cabeçalho ao rolar para baixo. */
  private scrollThreshold = 400;

  /** Posição vertical de rolagem da última leitura para cálculo de direção e velocidade. */
  private lastScrollY = 0;

  /** Temporizador para atraso gracioso de fechamento do menu dropdown no desktop. */
  private dropdownTimer: ReturnType<typeof setTimeout> | undefined;

  /** Serviço de roteamento do Angular para rastreamento de mudanças de URL. */
  private router = inject(Router);

  // MARK: - DOM View References
  /** Referência ao elemento de container do dropdown no DOM. */
  @ViewChild('dropdown') dropdownRef!: ElementRef;

  /** Referência ao menu de opções do dropdown no DOM. */
  @ViewChild('dropdownMenu') dropdownMenuRef!: ElementRef;

  // MARK: - Mobile Bottom Sheet Handlers
  /**
   * Abre a gaveta inferior móvel (Bottom Sheet Drawer), aplicando bloqueio de scroll no body.
   *
   * @param focusMaterials - Se verdadeiro, expande automaticamente o accordion de materiais.
   */
  public openBottomSheet(focusMaterials: boolean = false): void {
    this.isBottomSheetOpen.set(true);
    if (focusMaterials) {
      this.isAccordionOpen.set(true);
    }
    this.toggleBodyScroll(true);
  }

  /**
   * Fecha a gaveta inferior móvel e restaura a rolagem padrão da página.
   */
  public closeBottomSheet(): void {
    this.isBottomSheetOpen.set(false);
    this.toggleBodyScroll(false);
  }

  /**
   * Alterna a abertura ou fechamento da gaveta inferior móvel.
   */
  public toggleBottomSheet(): void {
    if (this.isBottomSheetOpen()) {
      this.closeBottomSheet();
    } else {
      this.openBottomSheet(false);
    }
  }

  /**
   * Alterna a expansão do accordion de materiais no menu mobile.
   */
  public toggleAccordion(): void {
    this.isAccordionOpen.update(v => !v);
  }

  /**
   * Gerencia o travamento da rolagem do documento com segurança SSR (Server-Side Rendering).
   *
   * @param lock - Define se o overflow do body deve ser bloqueado (`hidden`) ou liberado (`''`).
   */
  private toggleBodyScroll(lock: boolean): void {
    if (typeof document !== 'undefined') {
      document.body.style.overflow = lock ? 'hidden' : '';
    }
  }

  // MARK: - Desktop Navigation & Dropdown Handlers
  /**
   * Alterna o estado do menu principal no cabeçalho.
   */
  public toggleMenu(): void {
    this.isMenuOpen.update(v => !v);
  }

  /**
   * Fecha simultaneamente os menus e dropdowns abertos.
   */
  public closeMenu(): void {
    this.isMenuOpen.set(false);
    this.isDropdownOpen.set(false);
  }

  /**
   * Alterna o dropdown de materiais quando disparado por clique em dispositivos touch.
   *
   * @param event - Evento de clique do mouse/toque.
   */
  public toggleDropdown(event: MouseEvent): void {
    event.stopPropagation();
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    if (isMobile) {
      this.isDropdownOpen.update(v => !v);
    }
  }

  /**
   * Handler de entrada do cursor sobre o container de dropdown (desktop hover).
   */
  public onMouseEnter(): void {
    clearTimeout(this.dropdownTimer);
    this.isDropdownOpen.set(true);
  }

  /**
   * Handler de saída do cursor com atraso de tolerância de 300ms antes do fechamento.
   */
  public onMouseLeave(): void {
    this.dropdownTimer = setTimeout(() => {
      this.isDropdownOpen.set(false);
    }, 300);
  }

  // MARK: - Keyboard & Document Event Listeners
  /**
   * Escuta a tecla Escape no documento para fechar a Bottom Sheet de forma acessível.
   */
  @HostListener('window:keydown.escape')
  public onEscapePressed(): void {
    if (this.isBottomSheetOpen()) {
      this.closeBottomSheet();
    }
  }

  /**
   * Fecha o menu dropdown caso o usuário clique fora da sua área em telas desktop.
   *
   * @param event - Evento de clique no documento global.
   */
  @HostListener('document:click', ['$event'])
  public onDocumentClick(event: MouseEvent): void {
    if (this.dropdownRef?.nativeElement.contains(event.target)) {
      return;
    }
    
    if (this.dropdownMenuRef && !this.dropdownMenuRef.nativeElement.contains(event.target)) {
      this.isDropdownOpen.set(false);
    }
  }

  // MARK: - Lifecycle Hooks
  /**
   * Inicializa o componente e conecta os observadores de eventos de roteamento.
   */
  public ngOnInit(): void {
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.setScrollThreshold(event.urlAfterRedirects);
      this.closeBottomSheet();
      this.closeMenu();
    });
    this.setScrollThreshold(this.router.url);
  }

  // MARK: - Scroll Position & Threshold Calculation
  /**
   * Ajusta a sensibilidade de ocultação do cabeçalho de acordo com a rota ativa.
   *
   * @param url - Caminho relativo da rota atual.
   */
  private setScrollThreshold(url: string): void {
    if (url.includes('/videos')) {
      this.scrollThreshold = 90;
    } else if (url.includes('/doacao')) {
      this.scrollThreshold = 80;
    } else if (url.includes('/artigos')) {
      this.scrollThreshold = 50;
    } else if (url.includes('/sobre')) {
      this.scrollThreshold = 100;
    } else if (url.includes('/politica') || url.includes('/termos')) {
      this.scrollThreshold = 150;
    } else {
      this.scrollThreshold = 200;
    }
  }

  /**
   * Monitora a rolagem da janela para ocultar ou exibir o cabeçalho de acordo com a intenção do usuário.
   */
  @HostListener('window:scroll', [])
  public onWindowScroll(): void {
    if (typeof window === 'undefined') return;
    const currentScrollY = window.scrollY;
    
    // Mantém o cabeçalho visível próximo ao topo ou se algum menu estiver ativo
    if (currentScrollY <= 25 || this.isMenuOpen() || this.isBottomSheetOpen()) {
      this.isHeaderHidden.set(false);
      this.lastScrollY = currentScrollY;
      return;
    }

    const delta = currentScrollY - this.lastScrollY;

    // Rolagem para cima intencional: exibe o cabeçalho imediatamente
    if (delta < -6) {
      this.isHeaderHidden.set(false);
    }
    // Rolagem para baixo além do threshold: oculta suavemente para maximizar a área de leitura
    else if (delta > 6 && currentScrollY > this.scrollThreshold) {
      this.isHeaderHidden.set(true);
    }
    
    this.lastScrollY = currentScrollY;
  }
}
