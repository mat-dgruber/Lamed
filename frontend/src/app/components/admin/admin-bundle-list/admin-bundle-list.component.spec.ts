import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { importProvidersFrom } from '@angular/core';
import { of } from 'rxjs';

import { AdminBundleListComponent } from './admin-bundle-list.component';
import { BundleService } from '../../../services/bundle.service';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';

// Mock BundleService
class MockBundleService {
  getBundles() {
    return of([
      { id: 1, title: 'Test Bundle 1', trimester: 'Q1', lesson_number: 1 },
      { id: 2, title: 'Test Bundle 2', trimester: 'Q1', lesson_number: 2 }
    ]);
  }

  deleteBundle(id: number) {
    return of(null);
  }
}

describe('AdminBundleListComponent', () => {
  let component: AdminBundleListComponent;
  let fixture: ComponentFixture<AdminBundleListComponent>;
  let bundleService: BundleService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AdminBundleListComponent, // Import the standalone component
        RouterTestingModule,
        TableModule,
        ButtonModule
      ],
      providers: [
        importProvidersFrom(HttpClientTestingModule),
        { provide: BundleService, useClass: MockBundleService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminBundleListComponent);
    component = fixture.componentInstance;
    bundleService = TestBed.inject(BundleService); // Get the injected service
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('deve carregar os bundles ao inicializar (ngOnInit)', () => {
    spyOn(component, 'loadBundles').and.callThrough();
    component.ngOnInit();
    expect(component.loadBundles).toHaveBeenCalled();
  });

  it('deve ter uma lista de bundles após a inicialização', (done) => {
    component.bundles$?.subscribe(bundles => {
      expect(bundles.length).toBe(2);
      expect(bundles[0].title).toBe('Test Bundle 1');
      done();
    });
  });

  it('deve chamar deleteBundle do serviço quando o método do componente for chamado', () => {
    spyOn(bundleService, 'deleteBundle').and.callThrough();
    spyOn(window, 'confirm').and.returnValue(true); // Mock confirm dialog

    const idToDelete = 1;
    component.deleteBundle(idToDelete);

    expect(bundleService.deleteBundle).toHaveBeenCalledWith(idToDelete);
  });
  
  it('deve recarregar os bundles após a exclusão', () => {
    spyOn(bundleService, 'deleteBundle').and.returnValue(of(null));
    spyOn(component, 'loadBundles').and.callThrough();
    spyOn(window, 'confirm').and.returnValue(true);

    component.deleteBundle(1);

    expect(component.loadBundles).toHaveBeenCalled();
  });

});
