import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { inject } from '@angular/core';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="admin-container">
      <nav class="admin-sidebar">
        <div class="sidebar-header">
            <h2>Lamed Admin</h2>
        </div>
        <ul class="nav-links">
          <li><a routerLink="/admin/articles" routerLinkActive="active">Artigos</a></li>
          <li><a routerLink="/admin/guides" routerLinkActive="active">Guias de Estudo</a></li>
          <li><a (click)="logout()" class="logout-btn">Sair</a></li>
        </ul>
      </nav>
      <main class="admin-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .admin-container {
      display: flex;
      min-height: 100vh;
    }
    .admin-sidebar {
      width: 250px;
      background: #1e1e1e;
      color: #fff;
      padding: 1rem;
      display: flex;
      flex-direction: column;
    }
    .sidebar-header h2 {
        margin-top: 0;
        font-size: 1.5rem;
        color: #ffd700;
        border-bottom: 1px solid #333;
        padding-bottom: 1rem;
    }
    .nav-links {
      list-style: none;
      padding: 0;
      margin-top: 2rem;
    }
    .nav-links li {
      margin-bottom: 0.5rem;
    }
    .nav-links a {
      color: #ccc;
      text-decoration: none;
      display: block;
      padding: 0.75rem 1rem;
      border-radius: 4px;
      cursor: pointer;
      transition: background 0.2s;
    }
    .nav-links a:hover, .nav-links a.active {
      background: #333;
      color: #fff;
    }
    .logout-btn {
        margin-top: auto;
        color: #ff4d4d !important;
    }
    .admin-content {
      flex: 1;
      padding: 2rem;
      background: #f4f4f4;
      overflow-y: auto;
    }
  `]
})
export class AdminLayoutComponent {
  private auth = inject(Auth);

  logout() {
    this.auth.signOut();
  }
}
