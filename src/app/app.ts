import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './header/header'; // <-- PASSO 1: Adicione esta linha

@Component({
  selector: 'app-root',
  // PASSO 2: Adicione o HeaderComponent aqui
  imports: [RouterOutlet, Header],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('angular-lamed');
}