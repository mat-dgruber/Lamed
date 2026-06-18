import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { MessageService } from 'primeng/api';

import { Home } from './home';
import { BundleService } from '../../services/bundle.service';

describe('Home', () => {
  let component: Home;
  let fixture: ComponentFixture<Home>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [
        provideRouter([]),
        { provide: BundleService, useValue: { bundles: () => undefined, getBundles: () => of([]), getLatestBundle: () => of(null) } },
        { provide: MessageService, useValue: { add: () => {} } },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
