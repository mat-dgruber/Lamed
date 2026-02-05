import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { Editor } from 'primeng/editor';
import { ArticleService, Article } from '../../services/article.service';

@Component({
  selector: 'app-article-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LucideAngularModule, Editor],
  templateUrl: './article-editor.component.html',
  styles: [`
    :host ::ng-deep .p-editor-container .p-editor-content {
      height: 320px;
      font-family: inherit;
      font-size: 1rem;
    }
  `]
})
export class ArticleEditorComponent {
  private articleService = inject(ArticleService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  isEditMode = signal(false);
  isSaving = signal(false);

  // Temporary strings for inputs
  highlightsInput: string = '';
  tagsInput: string = '';

  model: Article = {
    title: '',
    subtitle: '',
    summary: '',
    cover_image: '',
    content: '',
    highlights: [],
    tags: [],
    is_active: true,
    author: 'Lamed'
  };

  constructor() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEditMode.set(true);
        this.articleService.getArticle(id).subscribe(data => {
            this.model = { ...data };
            if (!this.model.highlights) this.model.highlights = [];
            if (!this.model.tags) this.model.tags = [];
            
            // Initialize inputs
            this.highlightsInput = this.model.highlights.join(', ');
            this.tagsInput = this.model.tags.join(', ');
        });
      }
    });
  }

  save() {
    if (!this.model.title || !this.model.content) {
        alert('Título e Conteúdo são obrigatórios.');
        return;
    }

    this.isSaving.set(true);

    // Process inputs
    this.model.highlights = this.highlightsInput.split(',').map(s => s.trim()).filter(s => s.length > 0);
    this.model.tags = this.tagsInput.split(',').map(s => s.trim()).filter(s => s.length > 0);

    const request$ = this.isEditMode() && this.model.id
        ? this.articleService.updateArticle(this.model.id, this.model)
        : this.articleService.createArticle(this.model);

    request$.subscribe({
        next: (savedArticle) => {
            console.log('Article saved successfully', savedArticle);
            this.isSaving.set(false);
            this.router.navigate(['/admin/articles']);
        },
        error: (err) => {
            console.error('Error saving article', err);
            this.isSaving.set(false);
            alert('Erro ao salvar artigo. Verifique o console.');
        }
    });
  }
  
  // Custom fallback for image error
  onImageError(event: any) {
    event.target.src = 'assets/Imagens/Fundo_Lamed.png';
  }
}
