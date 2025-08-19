import { Component } from '@angular/core';
import { RouterLink } from '@angular/router'; // <-- Adicione esta linha

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink], // <-- E adicione aqui
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header {

}