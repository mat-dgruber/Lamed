import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';


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

  toggleTrimester(trimester: string): void {
    this.trimesterState[trimester] = !this.trimesterState[trimester];
  }
}
