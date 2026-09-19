import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import {
  LucideAngularModule,
  Mail,
  Clock,
  Youtube,
  Instagram,
  ExternalLink,
  Heart,
  FileQuestion,
  ChevronUp,
  ChevronDown,
  CheckCircle2,
  Info,
  Loader2,
  SendHorizontal,
  AlertCircle,
} from 'lucide-angular';

import { Contato } from './contato';
import { SeoService } from '../../core/services/seo.service';

describe('Contato Component', () => {
  let component: Contato;
  let fixture: ComponentFixture<Contato>;
  let httpTestingController: HttpTestingController;
  let seoServiceSpy: jasmine.SpyObj<SeoService>;

  beforeEach(async () => {
    seoServiceSpy = jasmine.createSpyObj('SeoService', ['updateTags']);

    await TestBed.configureTestingModule({
      imports: [
        Contato,
        LucideAngularModule.pick({
          Mail,
          Clock,
          Youtube,
          Instagram,
          ExternalLink,
          Heart,
          FileQuestion,
          ChevronUp,
          ChevronDown,
          CheckCircle2,
          Info,
          Loader2,
          SendHorizontal,
          AlertCircle,
        }),
      ],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: SeoService, useValue: seoServiceSpy },
      ],
    }).compileComponents();

    httpTestingController = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(Contato);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('deve ser instanciado e inicializar tags SEO', () => {
    expect(component).toBeTruthy();
    expect(seoServiceSpy.updateTags).toHaveBeenCalledWith(
      'Contato',
      jasmine.any(String),
      'assets/Imagens/Fundo_Lamed-total.png',
      jasmine.any(String)
    );
  });

  it('deve inicializar o formulário inválido quando vazio', () => {
    expect(component.contactForm.valid).toBeFalse();
    expect(component.contactForm.get('nome')?.value).toBe('');
    expect(component.contactForm.get('email')?.value).toBe('');
    expect(component.contactForm.get('assunto')?.value).toBe('');
    expect(component.contactForm.get('mensagem')?.value).toBe('');
  });

  it('deve validar formato correto de e-mail e tamanhos mínimos', () => {
    const nomeControl = component.contactForm.get('nome');
    const emailControl = component.contactForm.get('email');
    const assuntoControl = component.contactForm.get('assunto');
    const mensagemControl = component.contactForm.get('mensagem');

    // Nome curto
    nomeControl?.setValue('A');
    expect(nomeControl?.valid).toBeFalse();

    nomeControl?.setValue('Matheus');
    expect(nomeControl?.valid).toBeTrue();

    // E-mail inválido
    emailControl?.setValue('email-invalido');
    expect(emailControl?.valid).toBeFalse();

    emailControl?.setValue('matheus@exemplo.com');
    expect(emailControl?.valid).toBeTrue();

    // Assunto
    assuntoControl?.setValue('');
    expect(assuntoControl?.valid).toBeFalse();

    assuntoControl?.setValue('Dúvida sobre os estudos bíblicos');
    expect(assuntoControl?.valid).toBeTrue();

    // Mensagem curta
    mensagemControl?.setValue('Curta');
    expect(mensagemControl?.valid).toBeFalse();
    expect(component.mensagemLength).toBe(5);

    mensagemControl?.setValue('Mensagem detalhada com mais de dez caracteres');
    expect(mensagemControl?.valid).toBeTrue();
    expect(component.mensagemLength).toBeGreaterThanOrEqual(10);

    expect(component.contactForm.valid).toBeTrue();
  });

  it('deve alternar a expansão dos itens de FAQ', () => {
    expect(component.faqItems[0].expanded).toBeFalse();
    component.toggleFaq(0);
    expect(component.faqItems[0].expanded).toBeTrue();
    component.toggleFaq(0);
    expect(component.faqItems[0].expanded).toBeFalse();
  });

  it('deve enviar o formulário com sucesso para o Formspree e exibir feedback triunfante', fakeAsync(() => {
    component.contactForm.setValue({
      nome: 'Matheus Gruber',
      email: 'contato@lamed.com.br',
      assunto: 'Dúvida sobre os estudos bíblicos',
      mensagem: 'Gostaria de tirar uma dúvida sobre a lição desta semana.',
    });

    component.onSubmit();
    expect(component.isSubmitting).toBeTrue();

    const req = httpTestingController.expectOne('https://formspree.io/f/mjkevknj');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      nome: 'Matheus Gruber',
      email: 'contato@lamed.com.br',
      assunto: 'Dúvida sobre os estudos bíblicos',
      mensagem: 'Gostaria de tirar uma dúvida sobre a lição desta semana.',
    });

    req.flush({});
    tick();

    expect(component.isSubmitting).toBeFalse();
    expect(component.submissionSuccess).toBeTrue();
    expect(component.submissionError).toBeFalse();
    expect(component.contactForm.get('nome')?.value).toBe('');
  }));

  it('deve tratar erro na submissão e exibir mensagem de erro amigável', fakeAsync(() => {
    component.contactForm.setValue({
      nome: 'Visitante',
      email: 'visitante@email.com',
      assunto: 'Outro assunto',
      mensagem: 'Mensagem de teste para verificar comportamento de erro.',
    });

    component.onSubmit();
    expect(component.isSubmitting).toBeTrue();

    const req = httpTestingController.expectOne('https://formspree.io/f/mjkevknj');
    req.error(new ProgressEvent('Network error'), { status: 500, statusText: 'Server Error' });
    tick();

    expect(component.isSubmitting).toBeFalse();
    expect(component.submissionSuccess).toBeFalse();
    expect(component.submissionError).toBeTrue();
    expect(component.submissionMessage).toContain('Ocorreu um erro ao enviar a mensagem');
  }));

  it('deve redefinir o estado do formulário ao chamar resetFormState()', () => {
    component.submissionSuccess = true;
    component.submissionError = true;
    component.submissionMessage = 'Erro anterior';
    component.contactForm.get('nome')?.setValue('Teste');

    component.resetFormState();

    expect(component.submissionSuccess).toBeFalse();
    expect(component.submissionError).toBeFalse();
    expect(component.submissionMessage).toBe('');
    expect(component.contactForm.get('nome')?.value).toBe('');
  });
});
