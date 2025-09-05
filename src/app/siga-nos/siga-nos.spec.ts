import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SigaNos } from './siga-nos';

describe('SigaNos', () => {
  let component: SigaNos;
  let fixture: ComponentFixture<SigaNos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SigaNos]
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
