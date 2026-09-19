import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { SeoService } from '../../core/services/seo.service';

interface FaqItem {
  pergunta: string;
  resposta: string;
  expanded: boolean;
}

@Component({
  selector: 'app-contato',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LucideAngularModule],
  templateUrl: './contato.html',
  styleUrl: './contato.scss'
})
export class Contato implements OnInit {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private metaTagService = inject(SeoService);
  private router = inject(Router);

  readonly assuntos = [
    'Dúvida sobre os estudos bíblicos',
    'Pedido de oração',
    'Sugestão de conteúdo ou tema',
    'Contato institucional / Parcerias',
    'Problemas técnicos no site',
    'Outro assunto'
  ];

  readonly faqItems: FaqItem[] = [
    {
      pergunta: 'Onde encontro os materiais complementares em PDF?',
      resposta: 'Todos os resumos, infográficos e guias de estudo estão disponíveis gratuitamente na seção Materiais Extras do site.',
      expanded: false
    },
    {
      pergunta: 'Posso usar os vídeos do Lamed na minha igreja ou grupo?',
      resposta: 'Sim! Nosso conteúdo é produzido exatamente para edificar a igreja e comunidades de estudo. A reprodução pública e compartilhamento são livres.',
      expanded: false
    },
    {
      pergunta: 'Como posso apoiar a continuidade do ministério Lamed?',
      resposta: 'Você pode se tornar Membro Oficial em nosso canal do YouTube ou conhecer as outras formas de colaboração na página Apoie.',
      expanded: false
    },
    {
      pergunta: 'Qual o prazo médio de resposta para mensagens enviadas?',
      resposta: 'Nossa equipe lê todas as mensagens e responde pelo e-mail informado habitualmente em até 48 horas úteis.',
      expanded: false
    }
  ];

  contactForm = this.fb.group({
    nome: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    assunto: ['', Validators.required],
    mensagem: ['', [Validators.required, Validators.minLength(10)]]
  });

  isSubmitting = false;
  submissionSuccess = false;
  submissionError = false;
  submissionMessage = '';

  ngOnInit(): void {
    this.metaTagService.updateTags(
      'Contato',
      'Entre em contato com a equipe do Lamed. Envie suas dúvidas sobre estudos bíblicos, sugestões ou pedidos de oração.',
      'assets/Imagens/Fundo_Lamed-total.png',
      this.router.url
    );
  }

  get mensagemLength(): number {
    return this.contactForm.get('mensagem')?.value?.length || 0;
  }

  toggleFaq(index: number): void {
    this.faqItems[index].expanded = !this.faqItems[index].expanded;
  }

  onSubmit(): void {
    if (this.contactForm.valid) {
      this.isSubmitting = true;
      this.submissionSuccess = false;
      this.submissionError = false;
      this.submissionMessage = '';
      const formData = this.contactForm.value;
      const formspreeUrl = 'https://formspree.io/f/mjkevknj';

      this.http.post(formspreeUrl, formData).subscribe({
        next: () => {
          this.submissionSuccess = true;
          this.isSubmitting = false;
          this.contactForm.reset({
            nome: '',
            email: '',
            assunto: '',
            mensagem: ''
          });
        },
        error: () => {
          this.submissionError = true;
          this.submissionMessage = 'Ocorreu um erro ao enviar a mensagem. Por favor, verifique sua conexão ou tente novamente em alguns instantes.';
          this.isSubmitting = false;
        }
      });
    } else {
      this.contactForm.markAllAsTouched();
    }
  }

  resetFormState(): void {
    this.submissionSuccess = false;
    this.submissionError = false;
    this.submissionMessage = '';
    this.contactForm.reset({
      nome: '',
      email: '',
      assunto: '',
      mensagem: ''
    });
  }
}
