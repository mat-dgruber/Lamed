import { Routes } from '@angular/router';
import { AdminDashboardComponent } from './dashboard/dashboard.component';
import { BundleEditorComponent } from './bundle-editor/bundle-editor.component';

export const ADMIN_ROUTES: Routes = [
    { path: '', component: AdminDashboardComponent },
    { path: 'new', component: BundleEditorComponent },
    { path: 'edit/:id', component: BundleEditorComponent }
];
