import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { GuideService } from '../../../services/guide.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-admin-guide-list',
  standalone: true,
  imports: [CommonModule, RouterModule, TableModule, ButtonModule],
  template: `
    <div class="card">
        <div class="flex justify-content-between align-items-center mb-4">
            <h1>Gerenciar Guias de Estudo</h1>
            <button pButton label="Novo Guia" icon="pi pi-plus" routerLink="new"></button>
        </div>
        
        <p-table [value]="guides$ | async" [tableStyle]="{ 'min-width': '50rem' }">
            <ng-template pTemplate="header">
                <tr>
                    <th>Título</th>
                    <th>Trimestre</th>
                    <th>Lição #</th>
                    <th>Data</th>
                    <th>Ações</th>
                </tr>
            </ng-template>
            <ng-template pTemplate="body" let-guide>
                <tr>
                    <td>{{ guide.title }}</td>
                    <td>{{ guide.trimester }}</td>
                    <td>{{ guide.lesson_number }}</td>
                    <td>{{ guide.published_date | date }}</td>
                    <td>
                        <button pButton icon="pi pi-pencil" class="p-button-text" [routerLink]="[guide.id]"></button>
                        <button pButton icon="pi pi-trash" class="p-button-text p-button-danger" (click)="deleteGuide(guide.id)"></button>
                    </td>
                </tr>
            </ng-template>
        </p-table>
    </div>
  `,
  styles: [`
    .flex { display: flex; }
    .justify-content-between { justify-content: space-between; }
    .align-items-center { align-items: center; }
    .mb-4 { margin-bottom: 1rem; }
  `]
})
export class AdminGuideListComponent implements OnInit {
  guideService = inject(GuideService);
  guides$: Observable<any[]> | undefined;

  ngOnInit() {
    this.loadGuides();
  }

  loadGuides() {
    this.guides$ = this.guideService.getGuides();
  }

  deleteGuide(id: number) {
      if(confirm('Tem certeza que deseja deletar este guia?')) {
          this.guideService.deleteGuide(id).subscribe(() => {
              this.loadGuides();
          });
      }
  }
}
