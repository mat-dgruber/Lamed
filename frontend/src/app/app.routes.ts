import { Routes } from '@angular/router';
import { Home } from './componentes/home/home';
import { Videos } from './componentes/videos/videos';
import { BundleDetailComponent } from './pages/bundle-detail/bundle-detail.component';

export const routes: Routes = [
    { path: '', component: Home },
    { path: 'videos', component: Videos },
    { path: 'artigos', loadComponent: () => import('./componentes/artigos/artigos').then(m => m.Artigos) },
    { path: 'materiais-extras', loadComponent: () => import('./componentes/materiais-extras/materiais-extras').then(m => m.MateriaisExtras) },
    { path: 'sobre', loadComponent: () => import('./componentes/sobre/sobre').then(m => m.Sobre) },
    { path: 'apoie', loadComponent: () => import('./componentes/apoie/apoie').then(m => m.Apoie) },
    { path: 'contato', loadComponent: () => import('./componentes/contato/contato').then(m => m.Contato) },
    { path: 'siga-nos', loadComponent: () => import('./componentes/siga-nos/siga-nos').then(m => m.SigaNos) },
    { path: 'guia-de-estudos', loadComponent: () => import('./componentes/materiais-extras/materiais-extras').then(m => m.MateriaisExtras) }, // Assuming this maps to materials page for now, or check correct component.
    { path: 'termos-de-uso', loadComponent: () => import('./componentes/legal/termos/termos').then(m => m.Termos) },
    { path: 'politica-de-privacidade', loadComponent: () => import('./componentes/legal/politica/politica').then(m => m.Politica) },
    { path: 'bundle/:id', component: BundleDetailComponent },
    { 
      path: 'article/:id', 
      loadComponent: () => import('./pages/article-detail/article-detail.component').then(m => m.ArticleDetailComponent) 
    },
    { 
        path: 'admin', 
        loadChildren: () => import('./admin/admin.routes').then(m => m.ADMIN_ROUTES) 
    },
    // Redirects and wildcards
    { path: '**', redirectTo: '' }
];
