import { Routes } from '@angular/router';
import { Header } from './components/header/header';
import { Home } from './components/home/home';
import { Sobre } from './components/sobre/sobre';
import { Videos } from './components/videos/videos';
import { Artigos } from './components/artigos/artigos';
import { Apoie } from './components/apoie/apoie';
import { Artigo } from './components/artigo/artigo';
import { Politica } from './components/politica/politica-de-privacidade';
import { Termos } from './components/termos/termos-de-uso';
import { Contato } from './components/contato/contato';
import { GuiaDeEstudos } from './components/guia-de-estudos/guia-de-estudos';
import { SigaNos } from './components/siga-nos/siga-nos';
import { LoginComponent } from './components/login/login.component';

import { AdminLayoutComponent } from './components/admin/admin-layout/admin-layout.component';
import { AdminArticleListComponent } from './components/admin/admin-article-list/admin-article-list.component';
import { AdminArticleEditComponent } from './components/admin/admin-article-edit/admin-article-edit.component';
import { AdminBundleEditComponent } from './components/admin/admin-bundle-edit/admin-bundle-edit.component';
import { AdminBundleListComponent } from './components/admin/admin-bundle-list/admin-bundle-list.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
     {path: '', component: Home},
     {path: 'login', component: LoginComponent},
     {path: 'sobre', component: Sobre},
     {path: 'sobre', component: Sobre},
     {path: 'videos', component: Videos},
     {path: 'artigos', component: Artigos},
     {path: 'artigo/:id', component: Artigo},
     {path: 'apoie', component: Apoie},
     {path: 'politica-de-privacidade', component: Politica},
     {path: 'termos-de-uso', component: Termos},
     {path: 'contato', component: Contato},
     {path: 'guia-de-estudos', component: GuiaDeEstudos},
     {path: 'siga-nos', component: SigaNos},
     
     // Admin Routes
     {
        path: 'admin',
        component: AdminLayoutComponent,
        canActivate: [AuthGuard],
        children: [
            { path: 'articles', component: AdminArticleListComponent },
            { path: 'articles/new', component: AdminArticleEditComponent },
            { path: 'articles/:slug', component: AdminArticleEditComponent },
            
            { path: 'bundles', component: AdminBundleListComponent },
            { path: 'bundles/new', component: AdminBundleEditComponent },
            { path: 'bundles/:id', component: AdminBundleEditComponent },
            
            // Redirect guides to bundles or remove
            { path: 'guides', redirectTo: 'bundles', pathMatch: 'full' }, 
            
            { path: '', redirectTo: 'articles', pathMatch: 'full' }
        ]
     }
];
