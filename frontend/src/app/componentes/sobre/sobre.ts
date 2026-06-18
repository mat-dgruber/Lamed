import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild,
  inject,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MetaTagsService } from '../../services/meta-tags.service';
import { LucideAngularModule, TrendingUp, Heart, MoveRight, SignpostBig, X } from 'lucide-angular';
import Swiper, { type Swiper as SwiperInstance } from 'swiper';
import { Navigation } from 'swiper/modules';

export interface TeamMember {
  readonly id: number;
  name: string;
  role: string;
  photo: string;
  verse: string;
  bio: ReadonlyArray<string>;
  favoritePart?: string;
  favoritePartAnswer?: ReadonlyArray<string>;
}

@Component({
  selector: 'app-sobre',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './sobre.html',
  styleUrl: './sobre.scss'
})
export class Sobre implements OnInit, AfterViewInit, OnDestroy {
  private readonly metaTagService = inject(MetaTagsService);
  private readonly router = inject(Router);

  readonly isHistoryExpanded = signal(false);
  readonly selectedMember = signal<TeamMember | null>(null);
  readonly flippedCardId = signal<number | null>(null);
  readonly imageErrors = signal<ReadonlySet<number>>(new Set());

  @ViewChild('swiperContainer', { static: false })
  private swiperContainer?: ElementRef<HTMLElement>;

  private swiperInstance?: SwiperInstance;

  readonly icons = {
    TrendingUp,
    Heart,
    MoveRight,
    SignpostBig,
    X
  } as const;

  readonly teamMembers: ReadonlyArray<TeamMember> = [
    {
      id: 1,
      name: 'Matheus Diniz',
      role: 'Apresentador',
      photo: 'assets/Imagens/IMG_2347.JPG',
      verse: '"Mas minha vida não vale coisa alguma para mim, a menos que eu a use para completar [...] a missão que me foi confiada pelo Senhor Jesus: dar testemunho das boas-novas da graça de Deus." (At 20:24)',
      bio: [
        'Nascido em Tatuí, interior de SP, sou adventista desde o berço. Cresci vendo meus pais servir à igreja e foi nesse ambiente que desenvolvi amor pela Palavra de Deus.',
        'O Lamed nasceu do desejo de reacender nos jovens o mesmo encantamento pela Bíblia que eu vivi na infância.'
      ],
      favoritePart: 'Qual parte do processo de criação do Lamed mais te marcou?',
      favoritePartAnswer: [
        'Ver rostos de adolescentes dizendo "eu entendi a Bíblia pela primeira vez" não tem preço.',
        'Quando um professor me escreve dizendo que usou o material com a classe inteira e a discussão rendeu — aí sei que faz sentido continuar.'
      ]
    },
    {
      id: 2,
      name: 'Vitória Vitória',
      role: 'Designer',
      photo: 'assets/Imagens/IMG_2490.JPG',
      verse: '"O Senhor é o meu pastor; nada me faltará." (Sl 23:1)',
      bio: [
        'Sou designer e ajudo a transformar textos densos em algo visualmente acessível.',
        'Acredito que uma boa identidade visual fala a língua do jovem sem perder a profundidade do conteúdo.'
      ]
    },
    {
      id: 3,
      name: 'Isaías Lima',
      role: 'Revisor',
      photo: 'assets/Imagens/Isa.PNG',
      verse: '"Lâmpada para os meus pés é a tua palavra e luz para o meu caminho." (Sl 119:105)',
      bio: [
        'Reviso cada estudo com carinho porque sei que cada parágrafo será usado por um professor no fim de semana.',
        'Minha motivação é servir à igreja com o dom da palavra escrita.'
      ]
    },
    {
      id: 4,
      name: 'Felipe Rafael',
      role: 'Apoio',
      photo: 'assets/Imagens/Felipe.jpg',
      verse: '"Posso todas as coisas naquele que me fortalece." (Fp 4:13)',
      bio: [
        'Apoio o Lamed na produção e na logística, garantindo que cada vídeo e cada artigo chegue ao público com qualidade.',
        'É um privilégio servir nos bastidores.'
      ]
    },
    {
      id: 5,
      name: 'Felipe de Castro',
      role: 'Apoio',
      photo: 'assets/Imagens/Castro.PNG',
      verse: '"Sede fortes e corajosos." (Js 1:9)',
      bio: [
        'Contribuo com edição e operação de mídia para que a mensagem do Lamed alcance cada vez mais pessoas.',
        'Ver o projeto crescer é ver a mão de Deus.'
      ]
    }
  ];

  ngOnInit(): void {
    this.metaTagService.updateTags({
      title: 'Sobre Nós',
      description: 'Conheça a equipe e a história do Lamed — projeto dedicado ao estudo da Bíblia para adolescentes e jovens.',
      imageUrl: 'assets/Imagens/Fundo_Lamed-total.png',
      url: this.router.url
    });
  }

  ngAfterViewInit(): void {
    if (!this.swiperContainer) return;
    this.swiperInstance = new Swiper(this.swiperContainer.nativeElement, {
      modules: [Navigation],
      loop: false,
      rewind: true,
      slidesPerView: 1,
      spaceBetween: 10,
      breakpoints: { 768: { slidesPerView: 3, spaceBetween: 30 } },
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev'
      }
    });
  }

  ngOnDestroy(): void {
    this.swiperInstance?.destroy(true, true);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.selectedMember()) {
      this.closeModal();
    }
  }

  toggleHistory(): void {
    this.isHistoryExpanded.update((v) => !v);
  }

  navigateToApoie(): void {
    void this.router.navigate(['/apoie']);
  }

  onCardClick(member: TeamMember): void {
    if (this.flippedCardId() === member.id) {
      this.openModal(member);
      return;
    }
    this.flippedCardId.set(member.id);
  }

  onCardKey(event: KeyboardEvent, member: TeamMember): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.onCardClick(member);
    }
  }

  openModal(member: TeamMember): void {
    this.selectedMember.set(member);
  }

  closeModal(): void {
    this.selectedMember.set(null);
    this.flippedCardId.set(null);
  }

  onImageError(memberId: number): void {
    this.imageErrors.update((set) => {
      const next = new Set(set);
      next.add(memberId);
      return next;
    });
  }

  hasImageError(memberId: number): boolean {
    return this.imageErrors().has(memberId);
  }
}
