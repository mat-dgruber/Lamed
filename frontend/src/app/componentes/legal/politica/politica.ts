import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Shield, Cookie, ExternalLink, Mail, Eye, Lock, Database } from 'lucide-angular';
import { SeoService } from '../../../core/services/seo.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-politica',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './politica.html',
  styleUrl: './politica.scss'
})
export class Politica implements OnInit {
  private metaTagService = inject(SeoService);
  private router = inject(Router);

  // Icons used in template
  readonly icons = {
    Shield,
    Cookie,
    ExternalLink,
    Mail,
    Eye,
    Lock,
    Database
  };

  ngOnInit(): void {
    this.metaTagService.updateTags(
      'Política de Privacidade',
      'Entenda como o Lamed respeita e protege sua privacidade e seus dados.',
      'assets/Imagens/Fundo_Lamed-total.png',
      this.router.url
    );
  }
}
