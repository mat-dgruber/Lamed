import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, FileText, Ban, CheckCircle, AlertTriangle, Scale, Link2 } from 'lucide-angular';
import { SeoService } from '../../../core/services/seo.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-termos',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './termos.html',
  styleUrl: './termos.scss'
})
export class Termos implements OnInit {
  private metaTagService = inject(SeoService);
  private router = inject(Router);

  // Icons used in template
  readonly icons = {
    FileText,
    Ban,
    CheckCircle,
    AlertTriangle,
    Scale,
    Link2
  };

  ngOnInit(): void {
    this.metaTagService.updateTags(
      'Termos de Uso',
      'Leia os Termos de Uso do Lamed para entender as regras e responsabilidades ao usar nosso site.',
      'assets/Imagens/Fundo_Lamed-total.png',
      this.router.url
    );
  }
}
