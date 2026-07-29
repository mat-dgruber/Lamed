import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { Contato } from './contato';
import { SeoService } from '../../core/services/seo.service';

describe('Contato', () => {
  let component: Contato;
  let fixture: ComponentFixture<Contato>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Contato],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: SeoService, useValue: { updateTags: () => {} } },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(Contato);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
