import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SwiperOptions } from 'swiper/types';
import { register } from 'swiper/element/bundle';

// Chame a função register() para registrar os web components do Swiper
register();

export interface TeamMember {
  id: number;
  name: string;
  role: string;
  photoUrl: string;
  verse: string;
  bio: string;
  favoritePart: string;
}

@Component({
  selector: 'app-team-carousel',
  standalone: true,
  imports: [CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA], // Necessário para usar web components como o <swiper-container>
  template: `
    <swiper-container #swiper [config]="swiperConfig" init="false">
      <swiper-slide *ngFor="let member of teamMembers">
        <div class="team-member-card" (click)="!isMobile() ? openModal(member) : toggleFlip(member.id)" [class.is-flipped]="flippedCardId === member.id && isMobile()">
          <div class="card-front">
            <img [src]="'assets/' + member.photoUrl" [alt]="'Foto de ' + member.name" class="team-member-photo" loading="lazy">
            <h3>{{ member.name }}</h3>
            <p class="team-member-role">{{ member.role }}</p>
          </div>
          <div class="card-back">
            <h4>{{ member.name }}</h4>
            <p class="team-member-verse">"{{ member.verse }}"</p>
            <button class="details-button" (click)="openModal(member)">Ver Detalhes</button>
          </div>
        </div>
      </swiper-slide>
    </swiper-container>

    <!-- Modal -->
    <div class="modal" [class.is-open]="selectedMember">
      <div class="modal-content" *ngIf="selectedMember">
        <span class="close-button" (click)="closeModal()">&times;</span>
        <img [src]="'assets/' + selectedMember.photoUrl" [alt]="'Foto de ' + selectedMember.name" class="team-member-photo-modal" loading="lazy">
        <h2>{{ selectedMember.name }}</h2>
        <h3>{{ selectedMember.role }}</h3>
        <p [innerHTML]="selectedMember.bio"></p>
        <p><strong>Qual sua parte favorita no projeto Lamed?</strong><br>{{ selectedMember.favoritePart }}</p>
      </div>
       <!-- Fundo do modal para fechar ao clicar fora -->
      <div class="modal-background" (click)="closeModal()"></div>
    </div>
  `
})
export class TeamCarouselComponent implements OnInit {

  selectedMember: TeamMember | null = null;
  flippedCardId: number | null = null;

  teamMembers: TeamMember[] = [
    { id: 1, name: 'Matheus Diniz', role: 'Apresentador', photoUrl: 'Imagens/IMG_2347.JPG', verse: 'Atos 20:24', bio: 'Nascido em Tatuí (SP), Matheus Diniz sempre teve um grande apreço pelo estudo da Bíblia...', favoritePart: 'A parte que mais gosto é ver que Deus tem usado o Lamed para levar a mensagem à quem precisa.' },
    { id: 2, name: 'Neila Oliveira', role: 'Roterista e Apresentadora', photoUrl: 'Imagens/IMG_2312_Original.JPG', verse: 'Jeremias 29:11', bio: 'Neila Oliveira tem um carinho especial pelo universo das crianças e adolescentes...', favoritePart: 'A construção do roteiro. É o momento de mergulhar no tema e garantir que a mensagem seja fiel, profunda e relevante.' },
    { id: 3, name: 'Allana Matos', role: 'Apresentadora', photoUrl: 'Imagens/IMG_3771.PNG', verse: 'Romanos 5:19', bio: 'Allana Matos, com 18 anos, é estudante de Jornalismo no UNASP...', favoritePart: 'A minha parte preferida do projeto é saber que tem adolescentes procurando se achegar mais perto de Cristo.' },
    { id: 4, name: 'Maria Izabela', role: 'Escritora e Pesquisadora', photoUrl: 'Imagens/IMG_3772.JPG', verse: 'João 1:5', bio: 'O amor pela escrita e pela pesquisa bíblica é a força que impulsiona Maria Izabela...', favoritePart: 'O momento da "tradução". É quando consigo transformar um conceito complexo em algo claro, que toca o coração.' },
    { id: 5, name: 'Levi Gruber', role: 'Diretor de Arte', photoUrl: 'Imagens/IMG_2253.jpg', verse: 'João 3:16', bio: 'Levi Gruber é um designer gráfico com uma longa caminhada na comunicação visual...', favoritePart: 'A etapa da finalização. Ver o produto final com qualidade profissional, sabendo que ele vai comunicar a mensagem de forma clara e bonita.' },
    { id: 6, name: 'Lucas Nóbrega', role: 'Design e Editor de Vídeos', photoUrl: 'Imagens/IMG_3769.JPG', verse: 'Provérbios 24:5', bio: 'Nascido na capital de São Paulo em 2007, Lucas Nóbrega é um jovem curioso...', favoritePart: 'Minha parte favorita é o processo de edição de vídeo. Cada vídeo é um conteúdo único e a pós-produção é o momento crucial onde a mensagem é estruturada.' }
  ];

  swiperConfig: SwiperOptions = {
    loop: false,
    rewind: true,
    slidesPerView: 1,
    spaceBetween: 10,
    navigation: true,
    breakpoints: {
      768: {
        slidesPerView: 3,
        spaceBetween: 30
      }
    }
  };

  ngOnInit() {
    const swiperEl = document.querySelector('swiper-container');
    if (swiperEl) {
      Object.assign(swiperEl, this.swiperConfig);
      (swiperEl as any).initialize();
    }
  }

  isMobile(): boolean {
    return window.innerWidth <= 768;
  }

  toggleFlip(memberId: number) {
    if (this.flippedCardId === memberId) {
      // Se já está virado, desvira
      this.flippedCardId = null;
    } else {
      // Vira o card clicado
      this.flippedCardId = memberId;
    }
  }

  openModal(member: TeamMember) {
    this.selectedMember = member;
    document.body.style.overflow = 'hidden'; // Impede o scroll do fundo
  }

  closeModal() {
    this.selectedMember = null;
    document.body.style.overflow = ''; // Restaura o scroll
  }
}
