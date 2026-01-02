import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { EditorModule } from 'primeng/editor';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { ArticleService } from '../../../services/article.service';
import { Auth } from '@angular/fire/auth';

@Component({
  selector: 'app-admin-article-edit',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule,
    RouterModule,
    ButtonModule,
    InputTextModule,
    EditorModule,
    DatePickerModule,
    SelectModule
  ],
  template: `
    <div class="admin-page">
        <div class="header-section mb-5">
            <div>
                <h2 class="text-3xl font-bold text-white mb-2">{{ isEditing ? 'Editar Artigo' : 'Novo Artigo' }}</h2>
                <p class="text-gray-400">Preencha os detalhes do artigo abaixo.</p>
            </div>
            <button pButton label="Voltar" icon="pi pi-arrow-left" class="p-button-secondary custom-button-secondary" routerLink="/admin/articles"></button>
        </div>

        <div class="card p-5 bg-dark-card border-gray-700">
            <form [formGroup]="articleForm" (ngSubmit)="saveArticle()">
                <div class="grid">
                    <div class="col-12 md:col-8">
                        <div class="field mb-4">
                            <label for="title" class="block mb-2 font-bold text-gray-300">Título</label>
                            <input id="title" type="text" pInputText formControlName="title" class="w-full custom-input">
                        </div>

                        <div class="field mb-4">
                            <label for="slug" class="block mb-2 font-bold text-gray-300">Slug (URL)</label>
                            <input id="slug" type="text" pInputText formControlName="slug" class="w-full custom-input">
                        </div>

                        <div class="field mb-4">
                            <label for="content" class="block mb-2 font-bold text-gray-300">Conteúdo</label>
                            <p-editor formControlName="content" [style]="{ height: '400px' }" styleClass="custom-editor"></p-editor>
                        </div>
                    </div>

                    <div class="col-12 md:col-4">
                        <div class="field mb-4">
                            <label for="published_date" class="block mb-2 font-bold text-gray-300">Data de Publicação</label>
                            <p-datepicker formControlName="published_date" [showTime]="true" dateFormat="dd/mm/yy" class="w-full custom-input-date"></p-datepicker>
                        </div>

                        <div class="field mb-4">
                            <label for="tags" class="block mb-2 font-bold text-gray-300">Tags</label>
                            <input type="text" pInputText formControlName="tagsInput" class="w-full custom-input" placeholder="Ex: Escola Sabatina, Lição">
                        </div>

                        <div class="field mb-4">
                            <label for="author_id" class="block mb-2 font-bold text-gray-300">Autor</label>
                            <p-select [options]="authors" formControlName="author_id" optionLabel="username" optionValue="id" placeholder="Selecione um autor" class="w-full custom-input-select"></p-select>
                        </div>
                        
                        <div class="field mb-4">
                             <label class="block mb-2 font-bold text-gray-300">Banner (URL)</label>
                             <input type="text" pInputText formControlName="banner_path" class="w-full custom-input">
                        </div>

                        <div class="field mb-4 flex align-items-center gap-2">
                            <input type="checkbox" formControlName="published" id="published" class="custom-checkbox">
                            <label for="published" class="font-bold text-gray-300 cursor-pointer">Publicado</label>
                        </div>
                    </div>
                </div>

                <div class="flex justify-content-end mt-5 border-top-1 border-gray-700 pt-4">
                    <button pButton type="submit" [label]="isEditing ? 'Atualizar Artigo' : 'Criar Artigo'" icon="pi pi-check" [disabled]="articleForm.invalid" class="custom-button-primary p-button-lg"></button>
                </div>
            </form>
        </div>
    </div>
  `,
  styles: [`
    .admin-page { padding: 0; }
    .bg-dark-card { background-color: #1e1e1e; border-radius: 12px; border: 1px solid #333; }
    .text-white { color: #ffffff; }
    .text-gray-300 { color: #d1d5db; }
    .text-gray-400 { color: #9ca3af; }
    .border-gray-700 { border-color: #374151; }

    /* Custom Inputs */
    ::ng-deep .custom-input {
        background: #2a2a2a !important;
        border: 1px solid #444 !important;
        color: #fff !important;
        padding: 0.75rem 1rem !important;
        border-radius: 8px !important;
    }
    ::ng-deep .custom-input:focus {
        border-color: #ffd700 !important;
        box-shadow: 0 0 0 2px rgba(255, 215, 0, 0.2) !important;
    }

    /* Custom Checkbox */
    .custom-checkbox {
        width: 20px;
        height: 20px;
        accent-color: #ffd700;
        cursor: pointer;
    }
    .cursor-pointer { cursor: pointer; }

    /* Primary Button */
    ::ng-deep .custom-button-primary {
        background: #ffd700 !important;
        border: none !important;
        color: #000 !important;
        font-weight: 700 !important;
        border-radius: 8px !important;
    }
    ::ng-deep .custom-button-primary:hover {
        background: #ffed4a !important;
        transform: translateY(-2px);
    }
    ::ng-deep .custom-button-primary:disabled {
        background: #4b4b4b !important;
        color: #888 !important;
    }

    /* Secondary Button */
    ::ng-deep .custom-button-secondary {
        background: transparent !important;
        border: 1px solid #555 !important;
        color: #ccc !important;
        border-radius: 8px !important;
    }
    ::ng-deep .custom-button-secondary:hover {
        background: rgba(255, 255, 255, 0.05) !important;
        border-color: #777 !important;
        color: #fff !important;
    }

    .w-full { width: 100%; }
    .mb-2 { margin-bottom: 0.5rem; }
    .mb-4 { margin-bottom: 1.5rem; }
    .mb-5 { margin-bottom: 2rem; }
    .mt-5 { margin-top: 2rem; }
    .pt-4 { padding-top: 1.5rem; }
    .block { display: block; }
    .gap-2 { gap: 0.5rem; }
    .grid { display: flex; flex-wrap: wrap; margin-right: -1rem; margin-left: -1rem;}
    .col-12 { width: 100%; padding: 0 1rem; box-sizing: border-box; }
    @media (min-width: 768px) {
        .md\\:col-8 { width: 66.6666%; }
        .md\\:col-4 { width: 33.3333%; }
    }
    .flex { display: flex; }
    .justify-content-between { justify-content: space-between; }
    .justify-content-end { justify-content: flex-end; }
    .align-items-center { align-items: center; }
    .font-bold { font-weight: 700; }
    .text-3xl { font-size: 1.75rem; }
  `]
})
export class AdminArticleEditComponent implements OnInit {
  fb = inject(FormBuilder);
  articleService = inject(ArticleService);
  route = inject(ActivatedRoute);
  router = inject(Router);
  
  // Need to handle missing Auth provider if not provided in root
  auth = inject(Auth, {optional: true}); 

  articleForm = this.fb.group({
    title: ['', Validators.required],
    slug: ['', Validators.required],
    content: ['', Validators.required],
    summary: [''],
    banner_path: [''],
    tagsInput: [''], // Use string input for comma separated tags
    published: [false],
    published_date: [new Date()],
    author_id: [1] // Default to ID 1 (Lamed/Admin)
  });

  isEditing = false;
  currentSlug = '';
  authors = [{id: 1, username: 'Lamed'}, {id: 2, username: 'Maria Izabela'}]; // Mock

  ngOnInit() {
      const slug = this.route.snapshot.paramMap.get('slug');
      if (slug && slug !== 'new') {
          this.isEditing = true;
          this.currentSlug = slug;
          this.loadArticle(slug);
      }
  }

  loadArticle(slug: string) {
      this.articleService.getArticleById(slug).subscribe(data => {
          // Convert date string to Date object for Calendar
          const date = data.published_date ? new Date(data.published_date) : new Date();
          
          this.articleForm.patchValue({
              title: data.title,
              slug: data.slug,
              content: data.content,
              summary: data.summary,
              banner_path: data.banner_path,
              tagsInput: Array.isArray(data.tags) ? data.tags.join(', ') : '',
              published: data.published,
              published_date: date,
              author_id: 1 // TODO: Handle author mapping
          });
      });
  }

  saveArticle() {
      if (this.articleForm.invalid) return;

      const formVal = this.articleForm.value;
      const tagsArray = formVal.tagsInput ? formVal.tagsInput.split(',').map(t => t.trim()).filter(t => t) : [];
      
      const payload = {
          ...formVal,
          tags: tagsArray
      };

      if (this.isEditing) {
          this.articleService.updateArticle(this.currentSlug, payload).subscribe(() => {
              this.router.navigate(['/admin/articles']);
          });
      } else {
          this.articleService.createArticle(payload).subscribe(() => {
              this.router.navigate(['/admin/articles']);
          });
      }
  }
}
