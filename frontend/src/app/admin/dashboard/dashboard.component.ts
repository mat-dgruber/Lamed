import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { BundleService, Bundle } from '../../services/bundle.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule],
  template: `
    <div class="container mx-auto px-6 py-8">
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-3xl font-bold text-zinc-900 dark:text-zinc-50">Gerenciar Bundles</h1>
          <p class="text-zinc-500">Crie, edite e publique seus conteúdos semanais.</p>
        </div>
        <a routerLink="/admin/new" class="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 transition-colors">
          <lucide-icon [name]="'plus'" [size]="18"></lucide-icon>
          Novo Bundle
        </a>
      </div>

      <!-- List -->
      <div class="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 shadow-sm">
        <table class="w-full text-left text-sm text-zinc-500">
          <thead class="bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
            <tr>
              <th scope="col" class="px-6 py-4 font-medium">Título</th>
              <th scope="col" class="px-6 py-4 font-medium">Semana</th>
              <th scope="col" class="px-6 py-4 font-medium">Status</th>
              <th scope="col" class="px-6 py-4 font-medium text-right">Ações</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-zinc-200 dark:divide-zinc-800">
            <tr *ngFor="let bundle of bundles()" class="group hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
              <td class="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-100">
                {{ bundle.title }}
                <div class="text-xs font-normal text-zinc-500">{{ bundle.description | slice:0:50 }}...</div>
              </td>
              <td class="px-6 py-4">#{{ bundle.week_number }}</td>
              <td class="px-6 py-4">
                <span class="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset"
                  [ngClass]="bundle.is_active ? 'bg-green-50 text-green-700 ring-green-600/20' : 'bg-yellow-50 text-yellow-800 ring-yellow-600/20'">
                  {{ bundle.is_active ? 'Publicado' : 'Rascunho' }}
                </span>
              </td>
              <td class="px-6 py-4 text-right">
                <a [routerLink]="['/admin/edit', bundle.id]" class="text-blue-600 hover:text-blue-500 font-medium">Editar</a>
              </td>
            </tr>
             <tr *ngIf="bundles().length === 0">
              <td colspan="4" class="px-6 py-8 text-center text-zinc-400">
                Nenhum bundle encontrado. Comece criando um!
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class AdminDashboardComponent {
  private bundleService = inject(BundleService);
  bundles = this.bundleService.bundles;

  constructor() {
    // Force refresh or load logic here
    this.bundleService.getBundles(50, 0).subscribe();
  }
}
