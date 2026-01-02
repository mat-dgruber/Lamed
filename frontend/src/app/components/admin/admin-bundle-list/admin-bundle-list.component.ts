import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { BundleService } from '../../../services/bundle.service';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Component({
  selector: 'app-admin-bundle-list',
  standalone: true,
  imports: [CommonModule, RouterModule, TableModule, ButtonModule],
  template: `
    <div class="admin-page">
        <div class="header-section mb-5">
            <div>
                <h1 class="text-3xl font-bold text-white mb-2">Gerenciar Bundles</h1>
                <p class="text-gray-400">Organize os materiais de estudo semanais.</p>
            </div>
            <div class="flex gap-2">
                <button pButton label="Novo Bundle" icon="pi pi-plus" routerLink="/admin/bundles/new" class="custom-button-primary"></button>
            </div>
        </div>
        
        <div class="card p-0 overflow-hidden bg-dark-card border-gray-700">
            <p-table [value]="(bundles$ | async) || []" [tableStyle]="{ 'min-width': '50rem' }" styleClass="p-datatable-sm custom-table">
                <ng-template pTemplate="header">
                    <tr>
                        <th class="text-gold">Título</th>
                        <th class="text-gold">Trimestre</th>
                        <th class="text-gold">Lição #</th>
                        <th class="text-gold">Links</th>
                        <th class="text-gold text-right">Ações</th>
                    </tr>
                </ng-template>
                <ng-template pTemplate="body" let-bundle>
                    <tr class="hover:bg-gray-800 transition-colors">
                        <td class="text-white font-medium">{{ bundle.title }}</td>
                        <td class="text-gray-300">{{ bundle.trimester }}</td>
                        <td class="text-gray-300">{{ bundle.lesson_number }}</td>
                        <td class="text-gray-300">
                             <a *ngIf="bundle.youtube_link" [href]="bundle.youtube_link" target="_blank" class="text-gold mr-2"><i class="pi pi-youtube"></i></a>
                             <a *ngIf="bundle.article_link" [href]="bundle.article_link" target="_blank" class="text-blue-400"><i class="pi pi-link"></i></a>
                        </td>
                        <td class="text-right">
                            <button pButton icon="pi pi-pencil" class="p-button-text p-button-rounded text-gold hover:bg-gray-700" [routerLink]="['/admin/bundles', bundle.id]" pTooltip="Editar"></button>
                            <button pButton icon="pi pi-trash" class="p-button-text p-button-rounded text-red-400 hover:bg-gray-700" (click)="deleteBundle(bundle.id)" pTooltip="Excluir"></button>
                        </td>
                    </tr>
                </ng-template>
                <ng-template pTemplate="emptymessage">
                    <tr>
                        <td colspan="5" class="text-center p-4 text-gray-400">
                            Nenhum bundle encontrado. Clique em "Novo Bundle" para começar.
                            <div *ngIf="error" class="text-red-400 mt-2">Erro ao carregar: {{error}}</div>
                        </td>
                    </tr>
                </ng-template>
            </p-table>
        </div>
    </div>
  `,
  styles: [`
    .admin-page { padding: 0; }
    
    .bg-dark-card { background-color: #1e1e1e; border-radius: 12px; border: 1px solid #333; }
    .text-gold { color: #ffd700 !important; }
    .text-white { color: #ffffff; }
    .text-gray-300 { color: #d1d5db; }
    .text-gray-400 { color: #9ca3af; }
    .text-red-400 { color: #f87171; }
    .text-blue-400 { color: #60a5fa; }
    
    .custom-button-primary {
        background: #ffd700 !important;
        border: none !important;
        color: #000 !important;
        font-weight: 700 !important;
        border-radius: 8px !important;
    }
    .custom-button-primary:hover {
        background: #ffed4a !important;
        transform: translateY(-2px);
    }

    /* Table Styles */
    ::ng-deep .custom-table .p-datatable-header,
    ::ng-deep .custom-table .p-datatable-thead > tr > th {
        background: #1e1e1e !important;
        color: #ffd700 !important;
        border-bottom: 1px solid #333 !important;
    }
    ::ng-deep .custom-table .p-datatable-tbody > tr > td {
        background: #1e1e1e !important;
        color: #eee !important;
        border-bottom: 1px solid #2a2a2a !important;
    }
    ::ng-deep .custom-table .p-datatable-tbody > tr:hover > td {
        background: #2a2a2a !important;
    }

    .header-section {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .flex { display: flex; }
    .gap-2 { gap: 0.5rem; }
    .mr-2 { margin-right: 0.5rem; }
    .mb-2 { margin-bottom: 0.5rem; }
    .mb-5 { margin-bottom: 2rem; }
    .text-3xl { font-size: 1.75rem; }
    .font-bold { font-weight: 700; }
    .font-medium { font-weight: 500; }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
  `]
})
export class AdminBundleListComponent implements OnInit {
  bundleService = inject(BundleService);
  bundles$: Observable<any[]> | undefined;
  error = '';

  ngOnInit() {
    this.loadBundles();
  }

  loadBundles() {
    this.bundles$ = this.bundleService.getBundles().pipe(
        tap(data => console.log('Bundles loaded:', data)),
        catchError(err => {
            console.error('Error loading bundles:', err);
            this.error = 'Falha ao conectar ao servidor.';
            return of([]);
        })
    );
  }

  deleteBundle(id: number) {
      if(confirm('Tem certeza que deseja deletar este bundle?')) {
          this.bundleService.deleteBundle(id).subscribe(() => {
              this.loadBundles();
          });
      }
  }
}
