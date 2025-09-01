import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';


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
export class GuiaDeEstudos {
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
    ],
    '4': [
    ],
  };

  toggleTrimester(trimester: string): void {
    this.trimesterState[trimester] = !this.trimesterState[trimester];
  }

  getLessonsWithDownloads(trimester: string): Lesson[] {
    return this.Licoes[trimester].filter((lesson: Lesson) => lesson.downloadUrl);
  }
}
