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
    '1': [ { id: 1, title: 'Quem Receberá o Espírito Santo?', downloadUrl: 'assets/Downloads/GuiasDeEstudo/1Tri26/L1.pdf'},
      { id: 2, title: 'Quem Receberá o Espírito Santo?', downloadUrl: 'assets/Downloads/GuiasDeEstudo/1Tri26/L2.pdf'},
      { id: 3, title: 'Muito Mais que Esmola', downloadUrl: 'assets/Downloads/GuiasDeEstudo/1Tri26/L3.pdf'},
      { id: 4, title: 'Roubando a Deus', downloadUrl: 'assets/Downloads/GuiasDeEstudo/1Tri26/L4.pdf'},
      { id: 5, title: 'Quem Receberá o Espírito Santo?', downloadUrl: 'assets/Downloads/GuiasDeEstudo/1Tri26/L5.pdf'},
      { id: 6, title: 'Quem Receberá o Espírito Santo?', downloadUrl: 'assets/Downloads/GuiasDeEstudo/1Tri26/L6.pdf'},
      { id: 7, title: 'Quem Receberá o Espírito Santo?', downloadUrl: 'assets/Downloads/GuiasDeEstudo/1Tri26/L7.pdf'},
      { id: 8, title: 'Quem Receberá o Espírito Santo?', downloadUrl: 'assets/Downloads/GuiasDeEstudo/1Tri26/L8.pdf'},
      { id: 9, title: 'Quem Receberá o Espírito Santo?', downloadUrl: 'assets/Downloads/GuiasDeEstudo/1Tri26/L9.pdf'},
      { id: 10, title: 'Quem Receberá o Espírito Santo?', downloadUrl: 'assets/Downloads/GuiasDeEstudo/1Tri26/L10.pdf'},
      { id: 11, title: 'Quem Receberá o Espírito Santo?', downloadUrl: 'assets/Downloads/GuiasDeEstudo/1Tri26/L11.pdf'},
      { id: 12, title: 'Quem Receberá o Espírito Santo?', downloadUrl: 'assets/Downloads/GuiasDeEstudo/1Tri26/L12.pdf'},
      { id: 13, title: 'Quem Receberá o Espírito Santo?', downloadUrl: 'assets/Downloads/GuiasDeEstudo/1Tri26/L13.pdf'},
    ],
    '2': [],
    '3': [],
    '4': [],
  };

  toggleTrimester(trimester: string): void {
    this.trimesterState[trimester] = !this.trimesterState[trimester];
  }

  getLessonsWithDownloads(trimester: string): Lesson[] {
    return this.Licoes[trimester].filter((lesson: Lesson) => lesson.downloadUrl);
  }
}
