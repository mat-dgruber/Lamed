import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { FileUploadModule } from 'primeng/fileupload';
import { BundleService, LessonBundle } from '../../../services/bundle.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-admin-bundle-edit',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule, 
    RouterModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    FileUploadModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './admin-bundle-edit.component.html',
  styleUrls: ['./admin-bundle-edit.component.css']
})
export class AdminBundleEditComponent implements OnInit {
  fb = inject(FormBuilder);
  bundleService = inject(BundleService);
  route = inject(ActivatedRoute);
  router = inject(Router);
  messageService = inject(MessageService);

  bundleForm = this.fb.group({
    title: ['', Validators.required],
    trimester: ['', Validators.required],
    lesson_number: [null as number | null, Validators.required],
    youtube_link: [''],
    article_link: ['']
  });

  isEditing = false;
  currentId: number | null = null;
  loading = false;
  currentBundle: any = {};

  fileTypes = [
      { key: 'file_guide', label: 'Guia de Estudo (PDF)', urlKey: 'file_guide_url' },
      { key: 'file_slides', label: 'Slides (PPTX/PDF)', urlKey: 'file_slides_url' },
      { key: 'file_map', label: 'Mapa Mental (IMG)', urlKey: 'file_map_url' },
      { key: 'file_infographic', label: 'Infográfico (IMG)', urlKey: 'file_infographic_url' },
      { key: 'file_flashcards', label: 'Flashcards (PDF)', urlKey: 'file_flashcards_url' },
  ];

  selectedFiles: { [key: string]: File } = {};

  ngOnInit() {
      const id = this.route.snapshot.paramMap.get('id');
      if (id && id !== 'new') {
          this.isEditing = true;
          this.currentId = Number(id);
          this.loadBundle(this.currentId);
      }
  }

  loadBundle(id: number) {
      this.bundleService.getBundleById(id).subscribe(data => {
          this.currentBundle = data;
          this.bundleForm.patchValue({
              title: data.title,
              trimester: data.trimester,
              lesson_number: data.lesson_number,
              youtube_link: data.youtube_link,
              article_link: data.article_link
          });
      });
  }

  onFileSelect(event: any, key: string) {
      if (event.target.files.length > 0) {
          this.selectedFiles[key] = event.target.files[0];
      }
  }

  saveBundle() {
      if (this.bundleForm.invalid) return;
      
      this.loading = true;
      const formData = new FormData();
      Object.keys(this.bundleForm.controls).forEach(key => {
          const val = this.bundleForm.get(key)?.value;
          // Ensure we don't send empty strings for optional fields, letting backend default to None
          // But allow 0 for lesson_number if needed (though usually 1-indexed)
          if (val !== null && val !== undefined && val !== '') {
               formData.append(key, val);
          }
      });

      // Append files
      Object.keys(this.selectedFiles).forEach(key => {
          formData.append(key, this.selectedFiles[key]);
      });

      // TODO: Handle Edit (PUT is tricky with FormData in some setups, or strictly use same endpoint logic)
      // Since router implementation handles update logic mostly via same way or separate?
      // Wait, I didn't implement PUT /bundles/{id} in router yet, only POST.
      // I should update router.py to handle PUT for existing ID or just use create for now?
      // Since user wants to "edit", we need update logic.
      // For now, I will use POST for create. Update needs backend support.
      
      if (this.isEditing && this.currentId) {
          this.bundleService.updateBundle(this.currentId, formData).subscribe({
              next: () => {
                  this.messageService.add({severity:'success', summary:'Sucesso', detail:'Bundle atualizado!'});
                  setTimeout(() => this.router.navigate(['/admin/guides']), 1000);
              },
              error: () => {
                   this.messageService.add({severity:'error', summary:'Erro', detail:'Falha ao atualizar.'});
                   this.loading = false;
              }
          });
      } else {
          this.bundleService.createBundle(formData).subscribe({
              next: () => {
                  this.messageService.add({severity:'success', summary:'Sucesso', detail:'Bundle criado!'});
                  setTimeout(() => this.router.navigate(['/admin/guides']), 1000);
              },
              error: () => {
                   this.messageService.add({severity:'error', summary:'Erro', detail:'Falha ao salvar.'});
                   this.loading = false;
              }
          });
      }
  }
}
