import { Component, OnInit } from '@angular/core';
import { MetaTagService } from '../../services/meta-tag.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-termos',
  imports: [],
  templateUrl: './termos-de-uso.html',
  styleUrl: './termos-de-uso.css'
})
export class Termos implements OnInit {
  constructor(
    private metaTagService: MetaTagService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.metaTagService.updateTags(
      'Termos de Uso',
      'Leia os termos de uso do site e dos materiais produzidos pelo Lamed.',
      'assets/Imagens/Fundo_Lamed-total.png',
      this.router.url
    );
  }
}
