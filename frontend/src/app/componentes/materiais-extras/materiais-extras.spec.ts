import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MateriaisExtras } from './materiais-extras';

describe('MateriaisExtras', () => {
  let component: MateriaisExtras;
  let fixture: ComponentFixture<MateriaisExtras>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MateriaisExtras]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MateriaisExtras);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
