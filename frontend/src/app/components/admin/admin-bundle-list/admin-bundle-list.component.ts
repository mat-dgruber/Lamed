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
  templateUrl: './admin-bundle-list.component.html',
  styleUrls: ['./admin-bundle-list.component.css']
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
