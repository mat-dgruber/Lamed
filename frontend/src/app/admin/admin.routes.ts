import { Routes } from '@angular/router';
import { AdminDashboardComponent } from './dashboard/dashboard.component';
import { BundleEditorComponent } from './bundle-editor/bundle-editor.component';
import { AdminLoginComponent } from './login/login.component';
import { adminAuthGuard } from './auth.guard';

export const ADMIN_ROUTES: Routes = [
    { path: 'login', component: AdminLoginComponent },
    { path: '', component: AdminDashboardComponent, canActivate: [adminAuthGuard] },
    { path: 'new', component: BundleEditorComponent, canActivate: [adminAuthGuard] },
    { path: 'edit/:id', component: BundleEditorComponent, canActivate: [adminAuthGuard] }
];
