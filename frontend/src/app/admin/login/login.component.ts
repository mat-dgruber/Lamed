import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth, signInWithEmailAndPassword } from '@angular/fire/auth';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  templateUrl: './login.html'
})
export class AdminLoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(Auth);
  private router = inject(Router);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  isLoading = false;
  error = '';

  async onSubmit() {
    if (this.form.invalid) return;

    this.isLoading = true;
    this.error = '';

    const { email, password } = this.form.getRawValue();

    try {
      await signInWithEmailAndPassword(this.auth, email!, password!);
      this.router.navigate(['/admin']);
    } catch (err: any) {
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        this.error = 'Email ou senha incorretos.';
      } else if (err.code === 'auth/too-many-requests') {
        this.error = 'Muitas tentativas. Tente novamente mais tarde.';
      } else {
        this.error = 'Ocorreu um erro ao fazer login. Tente novamente.';
      }
      console.error(err);
    } finally {
      this.isLoading = false;
    }
  }
}
