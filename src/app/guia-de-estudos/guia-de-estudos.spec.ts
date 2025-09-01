import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuiaDeEstudos } from './guia-de-estudos';

describe('GuiaDeEstudos', () => {
  let component: GuiaDeEstudos;
  let fixture: ComponentFixture<GuiaDeEstudos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GuiaDeEstudos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GuiaDeEstudos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
