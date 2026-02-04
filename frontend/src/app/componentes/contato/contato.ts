import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { MetaTagsService } from '../../services/meta-tags.service';

@Component({
  selector: 'app-contato',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contato.html',
  styleUrl: './contato.scss'
})
export class Contato implements OnInit {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private metaTagService = inject(MetaTagsService);
  private router = inject(Router);

  contactForm = this.fb.group({
    nome: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    mensagem: ['', Validators.required]
  });

  isSubmitting = false;
  submissionMessage = '';

  ngOnInit(): void {
    this.metaTagService.updateTags(
      'Contato',
      'Entre em contato com a equipe do Lamed. Envie suas dúvidas, sugestões ou pedidos de oração.',
      'assets/Imagens/Fundo_Lamed-total.png',
      this.router.url
    );
  }

  onSubmit(): void {
    if (this.contactForm.valid) {
      this.isSubmitting = true;
      this.submissionMessage = '';
      const formData = this.contactForm.value;
      const formspreeUrl = 'https://formspree.io/f/mjkevknj';

      this.http.post(formspreeUrl, formData).subscribe({
        next: () => {
          this.submissionMessage = 'Mensagem enviada com sucesso!';
          this.isSubmitting = false;
          this.contactForm.reset();
        },
        error: () => {
          this.submissionMessage = 'Ocorreu um erro ao enviar a mensagem. Tente novamente mais tarde.';
          this.isSubmitting = false;
        }
      });
    } else {
      this.submissionMessage = 'Por favor, preencha todos os campos corretamente.';
    }
  }
}
