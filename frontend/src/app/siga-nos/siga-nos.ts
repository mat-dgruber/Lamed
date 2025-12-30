import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MetaTagService } from '../services/meta-tag.service';

@Component({
  selector: 'app-siga-nos',
  imports: [RouterLink],
  templateUrl: './siga-nos.html',
  styleUrl: './siga-nos.css'
})
export class SigaNos implements OnInit {
  constructor(
    private metaTagService: MetaTagService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.metaTagService.updateTags(
      'Siga-nos',
      'Acompanhe o Lamed nas redes sociais e fique por dentro de todas as novidades.',
      'assets/Imagens/Fundo_Lamed-total.png',
      this.router.url
    );
  }
}
