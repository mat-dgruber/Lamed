import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';

import { Artigos } from './artigos';
import { ArticleService } from '../../services/article.service';
import { SeoService } from '../../core/services/seo.service';

describe('Artigos', () => {
  let component: Artigos;
  let fixture: ComponentFixture<Artigos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Artigos],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ArticleService, useValue: { getArticles: () => of([]) } },
        { provide: SeoService, useValue: { updateTags: () => {} } },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(Artigos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
