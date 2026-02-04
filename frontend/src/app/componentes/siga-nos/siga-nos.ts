import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { LucideAngularModule, Youtube, Instagram, HeartHandshake, Mail, Globe } from 'lucide-angular';
import { MetaTagsService } from '../../services/meta-tags.service';

@Component({
  selector: 'app-siga-nos',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule],
  templateUrl: './siga-nos.html',
  styleUrl: './siga-nos.scss'
})
export class SigaNos implements OnInit {
  private metaTagService = inject(MetaTagsService);
  private router = inject(Router);

  readonly icons = {
    Youtube,
    Instagram,
    HeartHandshake, // Can serve as the heart hand icon replacement
    Mail,
    Globe // For the main site
  };

  ngOnInit(): void {
    this.metaTagService.updateTags(
      'Siga-nos',
      'Acompanhe o Lamed nas redes sociais e fique por dentro de todas as novidades.',
      'assets/Imagens/Fundo_Lamed-total.png', // Ensure this image exists, or fallback
      this.router.url
    );
  }
}
