import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Auth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, InputTextModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <div class="text-center mb-5">
            <div class="logo-container mx-auto mb-3">
                <i class="pi pi-shield text-5xl text-gold"></i>
            </div>
            <h2 class="text-3xl font-bold text-white mb-2">Lamed Admin</h2>
            <p class="text-gray-400">Acesso restrito ao painel.</p>
        </div>
        
        <div class="p-fluid">
            <div class="field mb-4">
                <label for="email" class="block text-gray-300 mb-2 font-medium">E-mail</label>
                <input id="email" type="email" pInputText [(ngModel)]="email" class="w-full custom-input" placeholder="seu@email.com">
            </div>

            <div class="field mb-4">
                <label for="password" class="block text-gray-300 mb-2 font-medium">Senha</label>
                <input id="password" type="password" pInputText [(ngModel)]="password" class="w-full custom-input" placeholder="••••••••">
            </div>

            <button pButton label="Acessar Painel" class="p-button-lg w-full mb-4 custom-button-primary" (click)="loginWithEmail()" [loading]="loading" [disabled]="!email || !password"></button>
            
            <div class="relative my-4">
                <div class="absolute top-50 left-0 w-full border-top-1 border-gray-700"></div>
                <div class="relative flex justify-content-center">
                    <span class="px-2 text-gray-500 bg-dark-card small-text">OU</span>
                </div>
            </div>

            <button pButton label="Entrar com Google" icon="pi pi-google" class="p-button-outlined p-button-secondary p-button-lg w-full custom-button-secondary" (click)="loginWithGoogle()"></button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
        display: block;
    }
    .text-gold { color: #ffd700; }
    .text-white { color: #ffffff; }
    .text-gray-300 { color: #d1d5db; }
    .text-gray-400 { color: #9ca3af; }
    .text-gray-500 { color: #6b7280; }
    .bg-dark-card { background-color: #1e1e1e; }
    .border-gray-700 { border-color: #374151; }

    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: #121212; /* Dark Background */
      padding: 1rem;
    }
    .login-card {
      background: #1e1e1e;
      border: 1px solid #333;
      border-radius: 16px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.5);
      width: 100%;
      max-width: 400px;
      padding: 2.5rem;
    }
    .logo-container {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        background: rgba(255, 215, 0, 0.1); /* Gold tint */
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid #ffd700;
        margin-bottom: 1.5rem;
    }
    .logo-container i {
        text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
    }
    
    /* Custom Inputs */
    ::ng-deep .custom-input {
        background: #2a2a2a !important;
        border: 1px solid #444 !important;
        color: #fff !important;
        padding: 1rem !important;
        border-radius: 8px !important;
    }
    ::ng-deep .custom-input:focus {
        border-color: #ffd700 !important;
        box-shadow: 0 0 0 2px rgba(255, 215, 0, 0.2) !important;
    }

    /* Primary Button (Gold) */
    ::ng-deep .custom-button-primary {
        background: #ffd700 !important;
        border: none !important;
        color: #000 !important;
        font-weight: 700 !important;
        border-radius: 8px !important;
        transition: transform 0.2s;
    }
    ::ng-deep .custom-button-primary:hover {
        background: #ffed4a !important;
        transform: translateY(-2px);
    }
    ::ng-deep .custom-button-primary:disabled {
        background: #4b4b4b !important;
        color: #888 !important;
    }

    /* Secondary Button (Outline) */
    ::ng-deep .custom-button-secondary {
        background: transparent !important;
        border: 1px solid #555 !important;
        color: #ccc !important;
        border-radius: 8px !important;
    }
    ::ng-deep .custom-button-secondary:hover {
        background: rgba(255, 255, 255, 0.05) !important;
        border-color: #777 !important;
        color: #fff !important;
    }

    .text-center { text-align: center; }
    .mx-auto { margin-left: auto; margin-right: auto; }
    .mb-2 { margin-bottom: 0.5rem; }
    .mb-3 { margin-bottom: 1rem; }
    .mb-4 { margin-bottom: 1.5rem; }
    .mb-5 { margin-bottom: 2rem; }
    .field { margin-bottom: 1.5rem; }
    .block { display: block; }
    .w-full { width: 100%; }
    .font-bold { font-weight: 700; }
    .font-medium { font-weight: 500; }
    .text-3xl { font-size: 1.75rem; }
    .text-5xl { font-size: 3rem; }
    .relative { position: relative; }
    .absolute { position: absolute; }
    .top-50 { top: 50%; }
    .left-0 { left: 0; }
    .flex { display: flex; }
    .justify-content-center { justify-content: center; }
    .px-2 { padding-left: 0.5rem; padding-right: 0.5rem; }
    .small-text { font-size: 0.875rem; letter-spacing: 1px; }
  `]
})
export class LoginComponent {
  private auth = inject(Auth);
  private router = inject(Router);

  email = '';
  password = '';
  loading = false;

  async loginWithEmail() {
      this.loading = true;
      try {
          await signInWithEmailAndPassword(this.auth, this.email, this.password);
          this.router.navigate(['/admin']);
      } catch (error: any) {
          console.error('Login failed', error);
          let msg = 'Falha no login.';
          if (error.code === 'auth/invalid-credential') msg = 'Credenciais incorretas.';
          if (error.code === 'auth/invalid-email') msg = 'Email inválido.';
          alert(msg);
      } finally {
          this.loading = false;
      }
  }

  async loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(this.auth, provider);
      this.router.navigate(['/admin']);
    } catch (error) {
      console.error('Login failed', error);
      alert('Login cancelado.');
    }
  }
}
