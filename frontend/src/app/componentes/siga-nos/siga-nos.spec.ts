import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { SigaNos } from './siga-nos';
import { SeoService } from '../../core/services/seo.service';

describe('SigaNos', () => {
  let component: SigaNos;
  let fixture: ComponentFixture<SigaNos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SigaNos],
      providers: [
        provideRouter([]),
        { provide: SeoService, useValue: { updateTags: () => {} } },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(SigaNos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
