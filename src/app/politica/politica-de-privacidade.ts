import { Component, OnInit } from '@angular/core';
import { MetaTagService } from '../services/meta-tag.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-politica',
  imports: [],
  templateUrl: './politica-de-privacidade.html',
  styleUrl: './politica-de-privacidade.css'
})
export class Politica implements OnInit {
  constructor(
    private metaTagService: MetaTagService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.metaTagService.updateTags(
      'Política de Privacidade',
      'Consulte a política de privacidade do Lamed para entender como lidamos com seus dados.',
      'assets/Imagens/Fundo_Lamed-total.png',
      this.router.url
    );
  }
}
