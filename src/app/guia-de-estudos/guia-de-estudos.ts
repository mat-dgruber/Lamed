import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MetaTagService } from '../services/meta-tag.service';
import { Router } from '@angular/router';


interface Lesson {
  id: number;
  title: string;
  downloadUrl: string;
}

@Component({
  selector: 'app-guia-de-estudos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './guia-de-estudos.html',
  styleUrls: ['./guia-de-estudos.css']
})
export class GuiaDeEstudos implements OnInit {
  constructor(
    private metaTagService: MetaTagService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.metaTagService.updateTags(
      'Guia de Estudos',
      'Baixe nossos guias de estudo semanais para aprofundar seu conhecimento da Lição da Escola Sabatina.',
      'assets/Imagens/Fundo_Lamed-total.png',
      this.router.url
    );
  }

  trimesterState: { [key: string]: boolean } = {
    '1': false,
    '2': false,
    '3': false,
    '4': false,
  };

  Licoes: { [key: string]: Lesson[] } = {
    '1': [],
    '2': [],
    '3': [
      { id: 9, title: 'COMO CRIANÇAS', downloadUrl: 'assets/Downloads/GuiasDeEstudo/3Tri25/L9.pdf' },
      { id: 10, title: 'ACORDE!', downloadUrl: 'assets/Downloads/GuiasDeEstudo/3Tri25/L10.pdf' },
      { id: 11, title: 'EM CIMA DA ÁRVORE', downloadUrl: 'assets/Downloads/GuiasDeEstudo/3Tri25/L11.pdf' },
      { id: 12, title: 'O VASO DE ALABASTRO', downloadUrl: 'assets/Downloads/GuiasDeEstudo/3Tri25/L12.pdf' },
      { id: 13, title: 'O PRIMEIRO LUGAR', downloadUrl: 'assets/Downloads/GuiasDeEstudo/3Tri25/L13.pdf'},
    ],
    '4': [
      { id: 1, title: 'REALIDADE OU FACHADA', downloadUrl: 'assets/Downloads/GuiasDeEstudo/4Tri25/L1.pdf'},
      { id: 2, title: 'DUAS CARAS, UM CORAÇÃO', downloadUrl: 'assets/Downloads/GuiasDeEstudo/4Tri25/L2.pdf' },
      { id: 3, title: 'PREPARANDO-SE PARA O AMANHÃ... HOJE', downloadUrl: 'assets/Downloads/GuiasDeEstudo/4Tri25/L3.pdf' },
      { id: 4, title: 'VIVENDO PARA SERVIR', downloadUrl: 'assets/Downloads/GuiasDeEstudo/4Tri25/L4.pdf' },
    ],
  };

  toggleTrimester(trimester: string): void {
    this.trimesterState[trimester] = !this.trimesterState[trimester];
  }

  getLessonsWithDownloads(trimester: string): Lesson[] {
    return this.Licoes[trimester].filter((lesson: Lesson) => lesson.downloadUrl);
  }
}
