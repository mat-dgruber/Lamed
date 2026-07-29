import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { Editor } from 'primeng/editor';
import { SharedModule } from 'primeng/api';
import { ArticleService, Article } from '../../services/article.service';
import { GoogleDriveImagePipe, convertGoogleDriveUrl } from '../../pipes/google-drive-image.pipe';

@Component({
  selector: 'app-article-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LucideAngularModule, Editor, SharedModule, GoogleDriveImagePipe],
  templateUrl: './article-editor.component.html',
  styles: [`
    :host ::ng-deep .p-editor-container {
      border-radius: 0.75rem;
      overflow: hidden;
      border-color: #e4e4e7;
    }
    :host ::ng-deep .p-editor-container .p-editor-toolbar {
      background-color: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
      padding: 0.5rem 0.75rem;
    }
    :host ::ng-deep .p-editor-container .p-editor-content {
      height: 420px;
      font-family: inherit;
      font-size: 1.05rem;
      line-height: 1.7;
    }
    :host ::ng-deep .p-editor-container .ql-editor {
      padding: 1.25rem;
    }
    :host ::ng-deep .p-editor-container .ql-editor blockquote {
      border-left: 4px solid #ea580c;
      background-color: #fff7ed;
      color: #3f3f46;
      font-style: italic;
      padding: 0.6rem 1.25rem;
      margin: 0.75rem 0;
      border-radius: 0 0.5rem 0.5rem 0;
    }
    :host ::ng-deep .p-editor-container .ql-editor blockquote + blockquote {
      margin-top: -0.75rem;
      padding-top: 0.25rem;
      border-top-right-radius: 0;
    }
    :host ::ng-deep .p-editor-container .ql-editor code {
      background-color: #f1f5f9;
      color: #0f172a;
      padding: 0.2rem 0.4rem;
      border-radius: 0.25rem;
      font-family: monospace;
    }
    :host ::ng-deep .p-editor-container .ql-editor pre.ql-syntax {
      background-color: #1e293b;
      color: #f8fafc;
      padding: 1rem;
      border-radius: 0.5rem;
      overflow-x: auto;
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
            
            // Convert any drive links in cover image
            if (this.model.cover_image) {
              this.model.cover_image = convertGoogleDriveUrl(this.model.cover_image);
            }

            // Initialize inputs
            this.highlightsInput = this.model.highlights.join(', ');
            this.tagsInput = this.model.tags.join(', ');
        });
      }
    });
  }

  onCoverImageInput() {
    if (this.model.cover_image) {
      this.model.cover_image = convertGoogleDriveUrl(this.model.cover_image.trim());
    }
  }

  save() {
    if (!this.model.title || !this.model.content) {
        alert('Título e Conteúdo são obrigatórios.');
        return;
    }

    this.isSaving.set(true);

    // Auto convert cover image Google Drive URL if present
    if (this.model.cover_image) {
      this.model.cover_image = convertGoogleDriveUrl(this.model.cover_image.trim());
    }

    // Auto convert any Google Drive images inside rich text content
    if (this.model.content) {
      this.model.content = this.processDriveImagesInHtml(this.model.content);
    }

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

  private processDriveImagesInHtml(html: string): string {
    return html.replace(/src=["'](https?:\/\/[^"']+)["']/gi, (match, url) => {
      if (url.includes('drive.google.com')) {
        const converted = convertGoogleDriveUrl(url);
        return `src="${converted}"`;
      }
      return match;
    });
  }
}

