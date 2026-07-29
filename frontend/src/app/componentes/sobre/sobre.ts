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
import { SeoService } from '../../core/services/seo.service';
import { LucideAngularModule, TrendingUp, Heart, MoveRight, SignpostBig } from 'lucide-angular';
import { TeamModalComponent } from '../shared/team-modal/team-modal.component';
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
  imports: [CommonModule, LucideAngularModule, TeamModalComponent],
  templateUrl: './sobre.html',
  styleUrl: './sobre.scss'
})
export class Sobre implements OnInit, AfterViewInit, OnDestroy {
  private readonly metaTagService = inject(SeoService);
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
    SignpostBig
  } as const;

  readonly teamMembers: ReadonlyArray<TeamMember> = [
    {
      id: 1,
      name: 'Matheus Diniz',
      role: 'Apresentador',
      photo: 'assets/Imagens/IMG_2347.JPG',
      verse: '"Mas minha vida não vale coisa alguma para mim, a menos que eu a use para completar [...] a missão que me foi confiada pelo Senhor Jesus: dar testemunho das boas-novas da graça de Deus." (At 20:24)',
      bio: [
        "Nascido em Tatuí (SP), Matheus Diniz sempre teve um grande apreço pelo estudo da Bíblia. O projeto Lamed nasceu justamente dessa vontade de compartilhar seus aprendizados de uma forma simples e acessível para mais pessoas. Com essa ideia em mente, ele deu o primeiro passo para criar o canal, onde hoje ajuda na coordenação das atividades e se dedica à edição dos vídeos, cuidando para que a mensagem seja transmitida com clareza e qualidade.",
        "Amante da comunicação, Matheus buscou a preparação ideal para dar forma ao projeto e formou-se em Produção Audiovisual pelo UNASP. Além de sua dedicação ao Lamed, ele também atua profissionalmente na área de tecnologia na CPB.",
        "Quando não está envolvido com os estudos ou a edição, Matheus gosta de dedicar seu tempo a outras paixões. Ele é um entusiasta da leitura e da escrita, está sempre atento às novidades do mundo da tecnologia e encontra no basquete uma ótima forma de se divertir e relaxar.",
        "Matheus valoriza suas raízes, sendo o filho mais novo de Levi Gruber e Neila Oliveira, e tem Maria Izabela como sua companheira de jornada para a vida."
      ],
      favoritePart: "Qual sua parte favorita no projeto Lamed?",
      favoritePartAnswer: [
        "\"A parte que mais gosto é ver que Deus tem usado o Lamed para levar a mensagem à quem precisa. Todo vídeo ou artigo postado tem um propósito; não importa o numero de views. Toda publicação é acompanhada da seguinte oração: 'que esse material seja alcançado por quem precisa, não necessariamente por um número muito grande de pessoas'\""
      ]
    },
    {
      id: 2,
      name: 'Neila Oliveira',
      role: 'Roteirista e Apresentadora',
      photo: 'assets/Imagens/IMG_2312_Original.JPG',
      verse: '"Porque eu sei os planos que tenho para vocês”, diz o Senhor. “São planos de bem, e não de mal, para lhes dar o futuro pelo qual anseiam." (Jr 29:11)',
      bio: [
        "Neila Oliveira tem um carinho especial pelo universo das crianças e adolescentes, e dedicou sua vida a entendê-los e a se comunicar com eles. Para fazer isso da melhor forma, formou-se em Letras e fez Mestrado em Educação, buscando sempre as ferramentas certas para criar um diálogo significativo e relevante com o público mais jovem.",
        "Essa paixão se transformou em uma longa carreira na Casa Publicadora Brasileira (CPB), onde trabalha há mais de 35 anos. Lá, ela ajuda na coordenação da área infantojuvenil e é uma das responsáveis pela edição da Lição da Escola Sabatina dos Adolescentes. É com toda essa experiência que ela contribui com o projeto Lamed, preparando cuidadosamente os roteiros para os vídeos semanais.",
        "Além de seu trabalho como escritora e palestrante, Neila valoriza muito sua família. Ela é casada com Levi Gruber há 31 anos e é mãe de Gabriel Gruber e do nosso colega de equipe, Matheus Diniz."
      ],
      favoritePart: "Qual sua parte favorita no projeto Lamed?",
      favoritePartAnswer: [
        "\"A construção do roteiro. É o momento de mergulhar no tema e garantir que a mensagem seja fiel, profunda e, ao mesmo tempo, relevante para a realidade dos nossos jovens. Saber que estamos entregando um conteúdo seguro e transformador é o que me realiza neste projeto.\""
      ]
    },
    // {
    //   id: 3,
    //   name: 'Allana Matos',
    //   role: 'Apresentadora',
    //   photo: 'assets/Imagens/IMG_3771.PNG',
    //   verse: '"Por causa da desobediência a Deus de uma só pessoa, muitos se tornaram pecadores. Mas, por causa da obediência de uma só pessoa a Deus, muitos serão declarados justos." (Rm 5:19)',
    //   bio: [
    //     "Allana Matos, com 18 anos, é estudante de Jornalismo no UNASP e uma verdadeira apaixonada por comunicação. Ela viu no projeto Lamed uma oportunidade de aprender e colocar em prática aquilo que mais gosta de fazer: conectar pessoas e compartilhar mensagens de forma criativa e cuidadosa.",
    //     "Seu primeiro contato com a equipe foi de um jeito bem especial. Durante o projeto \"10 Dias de Oração\" de 2024, ela teve a chance de ajudar nas gravações de uma série de podcasts em parceria com o canal Adventistas Brasil. A experiência foi tão positiva que, desde então, ela passou a fazer parte do time Lamed.",
    //     "Hoje, ela colabora com o projeto trazendo novas ideias e ajudando na criação de conteúdo, sempre com o olhar curioso de quem está aprendendo e o desejo de encontrar as melhores formas de dialogar com o público. Sua participação traz uma energia jovem e um novo fôlego para a equipe."
    //   ],
    //   favoritePart: "Qual sua parte favorita no projeto Lamed?",
    //   favoritePartAnswer: [
    //     "\"A minha parte preferida do projeto é saber que tem adolescentes procurando se achegar mais perto de Cristo e eu poder ajudar para que o Lamed seja mais um incentivo para que isso aconteça.\""
    //   ]
    // },
    {
      id: 3,
      name: 'Maria Izabela',
      role: 'Escritora e Pesquisadora',
      photo: 'assets/Imagens/IMG_3772.JPG',
      verse: '"A luz brilha na escuridão, e a escuridão nunca conseguiu apagá-la" (Jo 1:5)',
      bio: [
        "O amor pela escrita e pela pesquisa bíblica é a força que impulsiona Maria Izabela. Com formação em Teologia e atualmente cursando Jornalismo, Maria Izabela une o rigor da pesquisa bíblica com a clareza da comunicação.",
        "O seu principal objetivo é ajudar os jovens e adolescentes a se aprofundarem na Palavra de Deus. Com suas habilidades de pesquisa e escrita, ela contribui em várias frentes do projeto Lamed, sempre buscando criar um conteúdo que faça a diferença.",
        "Aos 22 anos, ela se sente feliz por poder colocar em prática seu sonho de ser escritora, usando seus talentos para servir neste ministério."
      ],
      favoritePart: "Qual sua parte favorita no projeto Lamed?",
      favoritePartAnswer: [
        "\"Essa é uma pergunta difícil, porque amo várias etapas do processo! Mas se eu tivesse que escolher uma, diria que é o momento da 'tradução'.\"",
        "\"É quando, depois de mergulhar na pesquisa de um tema bíblico, eu consigo encontrar as palavras certas para transformar um conceito que parece complexo em algo claro, que toca o coração. Ver esse texto se transformar em um roteiro e, depois, em um vídeo que realmente ajuda alguém a entender melhor a Palavra de Deus... não tem preço.\"",
        "\"É a união da minha paixão pela pesquisa com o propósito de servir. Para mim, essa é a essência do Lamed.\""
      ]
    },
    {
      id: 4,
      name: 'Levi Gruber',
      role: 'Diretor de Arte',
      photo: 'assets/Imagens/IMG_2253.jpg',
      verse: '"Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo o que nele crê não pereça, mas tenha a vida eterna." (Jo 3:16)',
      bio: [
        "Levi Gruber é um designer gráfico com uma longa caminhada na comunicação visual. Durante 33 anos, ele trabalhou na Casa Publicadora Brasileira (CPB), onde criou capas de livros e revistas que se tornaram muito conhecidas. Agora aposentado, ele dedica sua experiência e seu talento ao projeto Lamed.",
        "No dia a dia do Lamed, Levi cuida de toda a parte gráfica e da identidade visual, além de ser o nosso cameraman em todas as gravações. Seu trabalho já alcançou outros países, em projetos que desenvolveu para a igreja em nível mundial, como para a editora Safeliz e a Associação Geral.",
        "Ele é casado com Neila Oliveira, sua companheira há 31 anos, e é pai do Gabriel Gruber e do Matheus Diniz."
      ],
      favoritePart: "Qual sua parte favorita no projeto Lamed?",
      favoritePartAnswer: [
        "\"Para mim, é a etapa da finalização. É quando o roteiro, a imagem bem captada pela câmera e o design gráfico se unem. Ver o produto final com qualidade profissional, sabendo que ele vai comunicar a mensagem de forma clara e bonita, é a grande realização do trabalho.\""
      ]
    },
    {
      id: 5,
      name: 'Lucas Nóbrega',
      role: 'Design e Editor de Vídeos',
      photo: 'assets/Imagens/IMG_3769.JPG',
      verse: '"O homem sábio é forte, e o homem de conhecimento consolida a força." (Pv 24:5)',
      bio: [
        "Nascido na capital de São Paulo in 2007, Lucas Nóbrega é um jovem curioso e um entusiasta de novos aprendizados. Sua jornada começou na metrópole, mas aos três anos de idade, o interior se tornou seu lar, primeiro em Cerquilho e, posteriormente, em Tatuí. Foi nesta última cidade que seu caminho se cruzou com o dos organizadores do canal Lamed.",
        "Com uma paixão pela comunicação visual, Lucas possui formação técnica em Produção Multimídia pelo Sesi e atualmente cursa a graduação em Design Gráfico. Desde 2025, ele aplica seus conhecimentos técnicos auxiliando nas edições de vídeo do canal, transformando sua curiosidade em uma contribuição criativa e profissional para o projeto.",
        "Além de suas atividades acadêmicas e criativas, seus interesses são diversificados. Lucas transita com a mesma paixão entre a energia dos esportes, como o futebol e o tênis de mesa, e a tranquilidade da leitura e da arte da culinária. Essa conexão com o esporte e a cozinha foi cultivada desde a infância, e hoje ele pratica essas atividades por puro prazer e diversão."
      ],
      favoritePart: "Qual sua parte favorita no projeto Lamed?",
      favoritePartAnswer: [
        "\"Minha parte favorita é o processo de edição de vídeo. Cada vídeo é um conteúdo único, e a pós-produção é o momento crucial onde a mensagem é estruturada para atingir o público-alvo de forma eficaz e direta. Esse potencial é amplificado quando se trabalha com uma equipe competente e profissional, como a do Lamed, que é totalmente dedicada a oferecer o melhor conteúdo para o aprendizado do nosso público.\""
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
