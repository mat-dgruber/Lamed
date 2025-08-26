import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

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

  constructor(private fb: FormBuilder, private http: HttpClient) { }

  ngOnInit(): void {
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
