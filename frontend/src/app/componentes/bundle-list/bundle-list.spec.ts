import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BundleList } from './bundle-list';

describe('BundleList', () => {
  let component: BundleList;
  let fixture: ComponentFixture<BundleList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BundleList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BundleList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
