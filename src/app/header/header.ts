import { Component } from '@angular/core';
import { RouterLink } from '@angular/router'; // <-- Adicione esta linha
import { LucideAngularModule, Menu } from 'lucide-angular'; // <-- Importa o módulo LucideAngularModule

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, LucideAngularModule], // <-- E adicione aqui
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header {

}