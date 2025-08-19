import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class Data {
  constructor() { }

  private skills = [
    { name: 'HTML5', level: 'Avançado' },
    { name: 'CSS3', level: 'Avançado' },
    { name: 'JavaScript', level: 'Intermediário' },
    { name: 'TypeScript', level: 'Intermediário' },
    { name: 'Angular', level: 'Básico' },
    { name: 'Git', level: 'Intermediário' },
  ];

  private projects = [
    {
      title: 'Meu Site Pessoal (Angular)',
      description: 'O site que você está vendo agora, construído para demonstrar minhas habilidades com as mais recentes tecnologias Angular.',
      link: '#'
    },
    // ... outros projetos
  ];

  getSkills() {
    return this.skills;
  }

  getProjects() {
    return this.projects;
  }
}

