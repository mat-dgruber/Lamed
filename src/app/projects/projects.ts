import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // Importe o CommonModule para *ngFor

@Component({
  selector: 'app-projects',
  imports: [CommonModule],
  templateUrl: './projects.html',
  styleUrl: './projects.css'
})
export class Projects {
  projects = [
    {
      title: 'Meu Site Pessoal (Angular)',
      description: 'O site que você está vendo agora, construído para demonstrar minhas habilidades com as mais recentes tecnologias Angular.',
      link: 'https://github.com/seu-usuario/seu-repositorio' // Troque pelo link real no futuro
    },
    {
      title: 'Projeto 2: E-commerce',
      description: 'Uma plataforma de e-commerce completa com carrinho de compras, checkout e painel administrativo.',
      link: '#'
    },
    {
      title: 'Projeto 3: App de Clima',
      description: 'Um aplicativo que consome uma API de clima para exibir a previsão do tempo em tempo real.',
      link: '#'
    }
  ];
}
