import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { importProvidersFrom } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { AdminArticleListComponent } from './admin-article-list.component';
import { ArticleService } from '../../../services/article.service';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';

// Mock ArticleService
class MockArticleService {
  getArticles() {
    return of([
      { title: 'Test Article 1', slug: 'test-article-1', published_date: new Date(), published: true },
      { title: 'Test Article 2', slug: 'test-article-2', published_date: new Date(), published: false }
    ]);
  }

  deleteArticle(slug: string) {
    return of(null);
  }
}

describe('AdminArticleListComponent', () => {
  let component: AdminArticleListComponent;
  let fixture: ComponentFixture<AdminArticleListComponent>;
  let articleService: ArticleService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AdminArticleListComponent, // Import the standalone component
        RouterTestingModule,
        TableModule,
        ButtonModule
      ],
      providers: [
        importProvidersFrom(HttpClientTestingModule),
        provideAnimations(), // Required for PrimeNG components
        { provide: ArticleService, useClass: MockArticleService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminArticleListComponent);
    component = fixture.componentInstance;
    articleService = TestBed.inject(ArticleService); // Get the injected service
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('deve carregar os artigos ao inicializar (ngOnInit)', () => {
    spyOn(component, 'loadArticles').and.callThrough();
    component.ngOnInit();
    expect(component.loadArticles).toHaveBeenCalled();
  });

  it('deve ter uma lista de artigos após a inicialização', () => {
    // Trigger change detection/init
    fixture.detectChanges();
    
    // Check signal value
    const articles = component.articles();
    expect(articles.length).toBe(2);
    expect(articles[0].title).toBe('Test Article 1');
  });

  it('deve chamar deleteArticle do serviço quando o método do componente for chamado', () => {
    spyOn(articleService, 'deleteArticle').and.callThrough();
    spyOn(window, 'confirm').and.returnValue(true); // Mock confirm dialog

    const slugToDelete = 'test-article-1';
    component.deleteArticle(slugToDelete);

    expect(articleService.deleteArticle).toHaveBeenCalledWith(slugToDelete);
  });
  
  it('deve recarregar os artigos após a exclusão', () => {
    spyOn(articleService, 'deleteArticle').and.returnValue(of(null));
    spyOn(component, 'loadArticles').and.callThrough();
    spyOn(window, 'confirm').and.returnValue(true);

    component.deleteArticle('any-slug');

    expect(component.loadArticles).toHaveBeenCalled();
  });

});
