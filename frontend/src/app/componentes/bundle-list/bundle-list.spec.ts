import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { LucideAngularModule, Library, BookOpen } from 'lucide-angular';
import { of } from 'rxjs';

import { BundleList } from './bundle-list';
import { BundleService } from '../../services/bundle.service';

describe('BundleList', () => {
  let component: BundleList;
  let fixture: ComponentFixture<BundleList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BundleList, LucideAngularModule.pick({ Library, BookOpen })],
      providers: [
        provideRouter([]),
        {
          provide: BundleService,
          useValue: {
            bundles: () => undefined,
            getBundles: () => of([]),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BundleList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
