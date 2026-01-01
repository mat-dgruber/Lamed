import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { GuideService } from '../../../services/guide.service';

@Component({
  selector: 'app-admin-guide-edit',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule, 
    RouterModule, 
    ButtonModule, 
    InputTextModule, 
    InputNumberModule,
    DropdownModule
  ],
  template: `
    <div class="card p-4">
        <div class="flex justify-content-between align-items-center mb-4">
            <h2>{{ isEditing ? 'Editar Guia' : 'Novo Guia' }}</h2>
            <button pButton label="Voltar" icon="pi pi-arrow-left" class="p-button-secondary" routerLink="/admin/guides"></button>
        </div>

        <form [formGroup]="guideForm" (ngSubmit)="saveGuide()">
            
            <div class="field mb-3">
                <label for="title" class="block mb-1 font-bold">Título</label>
                <input id="title" type="text" pInputText formControlName="title" class="w-full">
            </div>

            <div class="field mb-3">
                <label for="download_url" class="block mb-1 font-bold">URL Download</label>
                <input id="download_url" type="text" pInputText formControlName="download_url" class="w-full">
            </div>

            <div class="field mb-3">
                 <label for="trimester" class="block mb-1 font-bold">Trimestre (Ex: 3Tri25)</label>
                 <input id="trimester" type="text" pInputText formControlName="trimester" class="w-full">
            </div>

            <div class="field mb-3">
                 <label for="lesson_number" class="block mb-1 font-bold">Número da Lição</label>
                 <p-inputNumber inputId="lesson_number" formControlName="lesson_number" class="w-full"></p-inputNumber>
            </div>
            
            <div class="field mb-3">
                 <label for="description" class="block mb-1 font-bold">Descrição (Opcional)</label>
                 <input id="description" type="text" pInputText formControlName="description" class="w-full">
            </div>
             
             <div class="field mb-3 flex align-items-center gap-2">
                <label for="published" class="font-bold">Publicado</label>
                <input type="checkbox" formControlName="published" id="published" style="width: 20px; height: 20px;">
            </div>

            <div class="flex justify-content-end mt-4">
                <button pButton type="submit" [label]="isEditing ? 'Atualizar' : 'Criar'" icon="pi pi-check" [disabled]="guideForm.invalid"></button>
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
    .flex { display: flex; }
    .align-items-center { align-items: center; }
    .justify-content-between { justify-content: space-between; }
    .justify-content-end { justify-content: flex-end; }
  `]
})
export class AdminGuideEditComponent implements OnInit {
  fb = inject(FormBuilder);
  guideService = inject(GuideService);
  route = inject(ActivatedRoute);
  router = inject(Router);

  guideForm = this.fb.group({
    title: ['', Validators.required],
    download_url: ['', Validators.required],
    trimester: ['', Validators.required],
    lesson_number: [1, Validators.required],
    description: [''],
    published: [true]
  });

  isEditing = false;
  currentId: number | null = null;

  ngOnInit() {
      const id = this.route.snapshot.paramMap.get('id');
      if (id && id !== 'new') {
          this.isEditing = true;
          this.currentId = Number(id);
          this.loadGuide(this.currentId);
      }
  }

  loadGuide(id: number) {
      this.guideService.getGuideById(id).subscribe(data => {
          this.guideForm.patchValue({
              title: data.title,
              download_url: data.download_url,
              trimester: data.trimester,
              lesson_number: data.lesson_number,
              description: data.description,
              published: data.published
          });
      });
  }

  saveGuide() {
      if (this.guideForm.invalid) return;

      const payload = this.guideForm.value;

      if (this.isEditing && this.currentId) {
          this.guideService.updateGuide(this.currentId, payload).subscribe(() => {
              this.router.navigate(['/admin/guides']);
          });
      } else {
          this.guideService.createGuide(payload).subscribe(() => {
              this.router.navigate(['/admin/guides']);
          });
      }
  }
}
