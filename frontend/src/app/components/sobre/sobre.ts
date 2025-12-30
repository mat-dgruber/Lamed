import { Component, AfterViewInit, ElementRef, HostListener, ViewEncapsulation, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Swiper from 'swiper';
import { Navigation } from 'swiper/modules';
import { MetaTagService } from '../../services/meta-tag.service';

@Component({
  selector: 'app-sobre',
  templateUrl: './sobre.html',
  styleUrls: ['./sobre.css'],
  encapsulation: ViewEncapsulation.None
})
export class Sobre implements AfterViewInit, OnInit {
  private swiper: Swiper | undefined;
  public activeModal: HTMLElement | null = null;

  constructor(private el: ElementRef, private router: Router, private metaTagService: MetaTagService) {}

  ngOnInit(): void {
    this.metaTagService.updateTags(
      'Sobre Nós',
      'Conheça a equipe e a história do Lamed, um ministério dedicado a criar recursos de estudo da Bíblia para adolescentes e jovens.',
      'assets/Imagens/Fundo_Lamed-total.png',
      this.router.url
    );
  }

  navigateToApoie(): void {
    this.router.navigate(['/apoie']);
  }

  ngAfterViewInit() {
    this.swiper = new Swiper('.team-swiper', {
      modules: [Navigation],
      loop: false,
      rewind: true,
      slidesPerView: 1,
      spaceBetween: 10,
      breakpoints: {
        768: {
          slidesPerView: 3,
          spaceBetween: 30,
        },
      },
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      watchSlidesProgress: true,
    });

    this.setupEventListeners();
  }

  setupEventListeners() {
    const teamCards = this.el.nativeElement.querySelectorAll('.team-member-card');
    teamCards.forEach((card: HTMLElement) => {
      card.addEventListener('click', (event) => this.onCardClick(event, card));
    });

    const closeButtons = this.el.nativeElement.querySelectorAll('.close-button');
    closeButtons.forEach((button: HTMLElement) => {
      button.addEventListener('click', () => this.closeModal());
    });

    const modals = this.el.nativeElement.querySelectorAll('.modal');
    modals.forEach((modal: HTMLElement) => {
      modal.addEventListener('click', (event) => {
        if (event.target === modal) {
          this.closeModal();
        }
      });
    });

    const readMoreButton = this.el.nativeElement.querySelector('#read-more-history');
    if (readMoreButton) {
      readMoreButton.addEventListener('click', () => {
        const expandableContent = this.el.nativeElement.querySelector('.expandable-content');
        if (expandableContent) {
          expandableContent.classList.toggle('expanded');
          if (expandableContent.classList.contains('expanded')) {
            readMoreButton.textContent = 'Ler menos';
          } else {
            readMoreButton.textContent = 'Ler mais';
            const historySection = this.el.nativeElement.querySelector('#history');
            if (historySection) {
              historySection.scrollIntoView({ behavior: 'smooth' });
            }
          }
        }
      });
    }
  }

  onCardClick(event: MouseEvent, card: HTMLElement) {
    if (this.swiper && this.swiper.touches.diff !== 0) {
      return;
    }

    if ((event.target as HTMLElement).closest('.card-back')) {
      if (card.classList.contains('is-flipped')) {
        const memberId = card.dataset['memberId'];
        if (memberId) {
          this.openModal(memberId);
        }
      }
    } else {
      card.classList.toggle('is-flipped');
      if (card.classList.contains('is-flipped')) {
        const allCards = this.el.nativeElement.querySelectorAll('.team-member-card');
        allCards.forEach((otherCard: HTMLElement) => {
          if (otherCard !== card) {
            otherCard.classList.remove('is-flipped');
          }
        });
      }
    }
  }

  openModal(memberId: string) {
    const modal = this.el.nativeElement.querySelector(`#modal-${memberId}`);
    if (!modal) return;

    this.activeModal = modal;
    this.activeModal!.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  closeModal() {
    if (!this.activeModal) return;

    const memberId = this.activeModal.id.split('-')[1];
    const card = this.el.nativeElement.querySelector(`.team-member-card[data-member-id="${memberId}"]`);
    if (card) {
      card.classList.remove('is-flipped');
    }

    this.activeModal.classList.remove('is-open');
    document.body.style.overflow = '';
    this.activeModal = null;
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape' && this.activeModal) {
      this.closeModal();
    }
  }
}
