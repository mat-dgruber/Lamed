import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MetaTagService } from '../../services/meta-tag.service';
import { Router } from '@angular/router';
import { GuideService } from '../../services/guide.service';

interface Lesson {
  id: number;
  title: string;
  downloadUrl: string;
  trimester?: string;
}

@Component({
  selector: 'app-guia-de-estudos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './guia-de-estudos.html',
  styleUrls: ['./guia-de-estudos.css']
})
export class GuiaDeEstudos implements OnInit {
  private metaTagService = inject(MetaTagService);
  private router = inject(Router);
  private guideService = inject(GuideService);

  trimesterState: { [key: string]: boolean } = {
    '3Tri25': true, // Open default
    '4Tri25': false
  };
  
  // Grouped lessons
  Licoes: { [key: string]: Lesson[] } = {};
  
  // Available trimesters keys
  trimesters: string[] = [];

  ngOnInit(): void {
    this.metaTagService.updateTags(
      'Guia de Estudos',
      'Baixe nossos guias de estudo semanais para aprofundar seu conhecimento da Lição da Escola Sabatina.',
      'assets/Imagens/Fundo_Lamed-total.png',
      this.router.url
    );
    
    this.loadGuides();
  }

  loadGuides() {
      this.guideService.getGuides().subscribe((data: any[]) => {
          // Group by trimester
          const grouped: { [key: string]: Lesson[] } = {};
          
          data.forEach(guide => {
              const tri = guide.trimester || 'Outros';
              if (!grouped[tri]) {
                  grouped[tri] = [];
              }
              grouped[tri].push({
                  id: guide.lesson_number,
                  title: guide.title,
                  downloadUrl: guide.download_url
              });
          });
          
          // Sort lessons by ID within trimester
          Object.keys(grouped).forEach(key => {
              grouped[key].sort((a, b) => a.id - b.id);
          });

          this.Licoes = grouped;
          this.trimesters = Object.keys(grouped).sort().reverse(); // Show latest first
          
          // Initialize state
          this.trimesters.forEach(t => {
              if (this.trimesterState[t] === undefined) {
                  this.trimesterState[t] = false;
              }
          });
      });
  }

  toggleTrimester(trimester: string): void {
    this.trimesterState[trimester] = !this.trimesterState[trimester];
  }

  getLessonsWithDownloads(trimester: string): Lesson[] {
    return this.Licoes[trimester] || [];
  }
}
