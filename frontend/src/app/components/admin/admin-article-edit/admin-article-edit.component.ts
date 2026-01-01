import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { EditorModule } from 'primeng/editor';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { ChipsModule } from 'primeng/chips';
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
    CalendarModule,
    DropdownModule,
    ChipsModule
  ],
  template: `
    <div class="card p-4">
        <div class="flex justify-content-between align-items-center mb-4">
            <h2>{{ isEditing ? 'Editar Artigo' : 'Novo Artigo' }}</h2>
            <button pButton label="Voltar" icon="pi pi-arrow-left" class="p-button-secondary" routerLink="/admin/articles"></button>
        </div>

        <form [formGroup]="articleForm" (ngSubmit)="saveArticle()">
            
            <div class="grid">
                <div class="col-12 md:col-8">
                    <div class="field mb-3">
                        <label for="title" class="block mb-1 font-bold">Título</label>
                        <input id="title" type="text" pInputText formControlName="title" class="w-full">
                    </div>

                    <div class="field mb-3">
                        <label for="slug" class="block mb-1 font-bold">Slug (URL)</label>
                        <input id="slug" type="text" pInputText formControlName="slug" class="w-full">
                    </div>

                    <div class="field mb-3">
                        <label for="content" class="block mb-1 font-bold">Conteúdo</label>
                        <p-editor formControlName="content" [style]="{ height: '400px' }"></p-editor>
                    </div>
                </div>

                <div class="col-12 md:col-4">
                    <div class="field mb-3">
                        <label for="published_date" class="block mb-1 font-bold">Data de Publicação</label>
                        <p-calendar formControlName="published_date" [showTime]="true" dateFormat="dd/mm/yy" class="w-full"></p-calendar>
                    </div>

                    <div class="field mb-3">
                        <label for="tags" class="block mb-1 font-bold">Tags</label>
                        <p-chips formControlName="tags"></p-chips>
                    </div>

                    <div class="field mb-3">
                        <label for="author_id" class="block mb-1 font-bold">Autor</label>
                        <!-- Mock Authors for now, ideally fetch from Users API -->
                        <p-dropdown [options]="authors" formControlName="author_id" optionLabel="username" optionValue="id" placeholder="Selecione um autor"></p-dropdown>
                    </div>
                    
                    <div class="field mb-3">
                         <label class="block mb-1 font-bold">Banner (Caminho/URL)</label>
                         <input type="text" pInputText formControlName="banner_path" class="w-full">
                    </div>

                    <div class="field mb-3 flex align-items-center gap-2">
                        <label for="published" class="font-bold">Publicado</label>
                         <!-- Native Checkbox for simplicity or p-checkbox -->
                        <input type="checkbox" formControlName="published" id="published" style="width: 20px; height: 20px;">
                    </div>
                </div>
            </div>

            <div class="flex justify-content-end mt-4">
                <button pButton type="submit" [label]="isEditing ? 'Atualizar' : 'Criar'" icon="pi pi-check" [disabled]="articleForm.invalid"></button>
            </div>
        </form>
    </div>
  `,
  styles: [`
    .w-full { width: 100%; }
    .mb-3 { margin-bottom: 1rem; }
    .mb-4 { margin-bottom: 1.5rem; }
    .block { display: block; }
    .gap-2 { gap: 0.5rem; }
    .grid { display: flex; flex-wrap: wrap; margin-right: -1rem; margin-left: -1rem;}
    .col-12 { width: 100%; padding: 0 1rem; box-sizing: border-box; }
    @media (min-width: 768px) {
        .md\\:col-8 { width: 66.6666%; }
        .md\\:col-4 { width: 33.3333%; }
    }
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
    tags: [[]],
    published: [false],
    published_date: [new Date()],
    author_id: [1] // Default to ID 1 (Lamed/Admin)
  });

  isEditing = false;
  currentSlug = '';
  authors = [{id: 1, username: 'Lamed'}, {id: 2, username: 'Maria Izabela'}]; // Mock

  ngOnInit() {
      const slug = this.route.snapshot.paramMap.get('slug');
      if (slug) {
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
              tags: data.tags,
              published: data.published,
              published_date: date,
              author_id: 1 // TODO: Handle author mapping
          });
      });
  }

  saveArticle() {
      if (this.articleForm.invalid) return;

      const formVal = this.articleForm.value;
      const payload = {
          ...formVal,
          // Ensure tags is array
          tags: Array.isArray(formVal.tags) ? formVal.tags : [] 
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
