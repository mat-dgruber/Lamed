import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MetaTagService } from '../services/meta-tag.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-contato',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './contato.html',
  styleUrl: './contato.css'
})
export class Contato implements OnInit {
  contactForm!: FormGroup;
  isSubmitting = false;
  submissionMessage = '';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private metaTagService: MetaTagService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.metaTagService.updateTags(
      'Contato',
      'Entre em contato com a equipe do Lamed. Envie suas dúvidas, sugestões ou pedidos de oração.',
      'assets/Imagens/Fundo_Lamed-total.png',
      this.router.url
    );
    this.contactForm = this.fb.group({
      nome: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      mensagem: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.contactForm.valid) {
      this.isSubmitting = true;
      this.submissionMessage = '';
      const formData = this.contactForm.value;
      const formspreeUrl = 'https://formspree.io/f/mjkevknj';

      this.http.post(formspreeUrl, formData).subscribe(
        (response) => {
          this.submissionMessage = 'Mensagem enviada com sucesso!';
          this.isSubmitting = false;
          this.contactForm.reset();
        },
        (error) => {
          this.submissionMessage = 'Ocorreu um erro ao enviar a mensagem. Tente novamente mais tarde.';
          this.isSubmitting = false;
        }
      );
    } else {
      this.submissionMessage = 'Por favor, preencha todos os campos corretamente.';
    }
  }
}
