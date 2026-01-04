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
  templateUrl: './admin-article-edit.component.html',
  styleUrls: ['./admin-article-edit.component.css']
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
