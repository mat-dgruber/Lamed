import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // Importe o CommonModule para *ngFor

@Component({
  selector: 'app-skills',
  standalone: true,
  imports: [CommonModule], // Adicione aqui
  templateUrl: './skills.html',
  styleUrl: './skills.css'
})
export class Skills {
  // Verifique se esta seção está exatamente assim
  skills = [
    { name: 'HTML5', level: 'Avançado' },
    { name: 'CSS3', level: 'Avançado' },
    { name: 'JavaScript', level: 'Intermediário' },
    { name: 'TypeScript', level: 'Intermediário' },
    { name: 'Angular', level: 'Básico' },
    { name: 'Git', level: 'Intermediário' },
  ];
}