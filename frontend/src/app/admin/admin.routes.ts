import { Routes } from '@angular/router';
import { AdminDashboardComponent } from './dashboard/dashboard.component';
import { BundleEditorComponent } from './bundle-editor/bundle-editor.component';
import { AdminLoginComponent } from './login/login.component';
import { adminAuthGuard } from './auth.guard';
import { ArticleListComponent } from './article-list/article-list.component';
import { ArticleEditorComponent } from './article-editor/article-editor.component';

export const ADMIN_ROUTES: Routes = [
    { path: 'login', component: AdminLoginComponent },
    { path: '', component: AdminDashboardComponent, canActivate: [adminAuthGuard] },
    { path: 'new', component: BundleEditorComponent, canActivate: [adminAuthGuard] },
    { path: 'edit/:id', component: BundleEditorComponent, canActivate: [adminAuthGuard] },
    
    // Article Routes
    { path: 'articles', component: ArticleListComponent, canActivate: [adminAuthGuard] },
    { path: 'articles/new', component: ArticleEditorComponent, canActivate: [adminAuthGuard] },
    { path: 'articles/:id', component: ArticleEditorComponent, canActivate: [adminAuthGuard] },

    // Video Routes
    { path: 'videos', loadComponent: () => import('./videos/admin-videos.component').then((m) => m.AdminVideosComponent), canActivate: [adminAuthGuard] }
];

