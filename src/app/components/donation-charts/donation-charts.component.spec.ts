import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DonationChartsComponent } from './donation-charts.component';

describe('DonationChartsComponent', () => {
  let component: DonationChartsComponent;
  let fixture: ComponentFixture<DonationChartsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DonationChartsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DonationChartsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
