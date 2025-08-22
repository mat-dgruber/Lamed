import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './header/header';
import { Footer } from "./footer/footer"; 
import { FloatingButtonsComponent } from './components/floating-buttons/floating-buttons.component';



@Component({
  selector: 'app-root',
  // PASSO 2: Adicione o HeaderComponent aqui
  imports: [RouterOutlet, Header, Footer, FloatingButtonsComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('angular-lamed');
}