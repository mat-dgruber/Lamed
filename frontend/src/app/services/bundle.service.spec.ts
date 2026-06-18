import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { BundleService, Bundle } from './bundle.service';
import { environment } from '../../environments/environment';

describe('BundleService', () => {
  let service: BundleService;
  let httpMock: HttpTestingController;
  const apiUrl = environment.apiUrl;

  const mockBundles: Bundle[] = [
    {
      id: '1',
      title: 'Bundle 1',
      description: 'Desc 1',
      week_number: 1,
      is_active: true,
      resources: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [BundleService]
    });
    service = TestBed.inject(BundleService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch bundles via GET and set the bundles signal', () => {
    service.getBundles(10, undefined, true).subscribe((bundles) => {
      expect(bundles.length).toBe(1);
      expect(bundles).toEqual(mockBundles);
      expect(service.bundles()).toEqual(mockBundles);
    });

    const req = httpMock.expectOne((request) => request.url === `${apiUrl}/bundles/`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('limit')).toBe('10');
    expect(req.request.params.get('start_after_id')).toBeNull();
    expect(req.request.params.get('only_active')).toBe('true');
    req.flush(mockBundles);
  });

  it('should pass start_after_id parameter if startAfterId is provided', () => {
    service.getBundles(10, 'last-id', true).subscribe();

    const req = httpMock.expectOne((request) => request.url === `${apiUrl}/bundles/`);
    expect(req.request.params.get('start_after_id')).toBe('last-id');
    req.flush(mockBundles);
  });

  it('should get bundle by id', () => {
    service.getBundleById('1').subscribe((bundle) => {
      expect(bundle).toEqual(mockBundles[0]);
    });

    const req = httpMock.expectOne(`${apiUrl}/bundles/1/`);
    expect(req.request.method).toBe('GET');
    req.flush(mockBundles[0]);
  });

  it('should create bundle via POST', () => {
    const newBundle = {
      title: 'New',
      description: 'New desc',
      week_number: 2,
      resources: [],
      is_active: false
    };

    service.createBundle(newBundle).subscribe((bundle) => {
      expect(bundle.title).toBe('New');
    });

    const req = httpMock.expectOne(`${apiUrl}/bundles/`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newBundle);
    req.flush({ ...newBundle, id: '2', created_at: '', updated_at: '' });
  });

  it('should handle error and return empty array in getBundles', () => {
    service.getBundles().subscribe((bundles) => {
      expect(bundles).toEqual([]);
    });

    const req = httpMock.expectOne((request) => request.url === `${apiUrl}/bundles/`);
    req.error(new ErrorEvent('Network error'));
  });
});
