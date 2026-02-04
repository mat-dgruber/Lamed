import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Apoie } from './apoie';

describe('Apoie', () => {
  let component: Apoie;
  let fixture: ComponentFixture<Apoie>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Apoie]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Apoie);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
