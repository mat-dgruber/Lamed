import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AdminDashboardComponent } from './dashboard.component';
import { Bundle } from '../../services/bundle.service';
import { environment } from '../../../environments/environment';
import {
  LucideAngularModule,
  Sparkles,
  FileText,
  Video,
  RefreshCw,
  Plus,
  BookOpen,
  CheckCircle2,
  Clock,
  CheckSquare,
  Circle,
  ArrowRight,
  ArrowLeft,
  Search,
  X,
  Pencil,
  Trash2,
  AlertCircle,
  Info,
  File,
  Compass,
  User,
  ExternalLink,
} from 'lucide-angular';

describe('AdminDashboardComponent', () => {
  let component: AdminDashboardComponent;
  let fixture: ComponentFixture<AdminDashboardComponent>;
  let httpMock: HttpTestingController;

  const mockBundles: Bundle[] = [
    {
      id: 'bundle-1',
      title: 'A Promessa da Aliança',
      description: 'Estudo aprofundado sobre Gênesis',
      week_number: 10,
      author: 'Lamed',
      published_at: '2026-03-01T10:00:00.000Z',
      video_id: 'vid-123',
      thumbnail_url: 'https://img.youtube.com/vi/vid-123/hqdefault.jpg',
      article_url: 'https://lamed.org/artigo-1',
      resources: [{ title: 'Guia PDF', type: 'pdf', url: 'https://files.com/guia.pdf' }],
      is_active: true,
      created_at: '2026-03-01T10:00:00.000Z',
      updated_at: '2026-03-01T10:00:00.000Z',
    },
    {
      id: 'bundle-2',
      title: 'O Êxodo e a Libertação',
      description: 'Caminho pelo deserto',
      week_number: 11,
      author: 'Lamed',
      published_at: '2026-03-08T10:00:00.000Z',
      resources: [],
      is_active: false,
      created_at: '2026-03-08T10:00:00.000Z',
      updated_at: '2026-03-08T10:00:00.000Z',
    },
  ];

  const mockAnalyticsOverview = {
    configured: true,
    property_id: '421098765',
    summary: {
      active_users: 1420,
      active_users_growth: 20.3,
      sessions: 2890,
      sessions_growth: 17.9,
      page_views: 8750,
      page_views_growth: 19.8,
      avg_duration_seconds: 185,
      bounce_rate: 38.5,
    },
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AdminDashboardComponent,
        HttpClientTestingModule,
        RouterTestingModule,
        LucideAngularModule.pick({
          Sparkles,
          FileText,
          Video,
          RefreshCw,
          Plus,
          BookOpen,
          CheckCircle2,
          Clock,
          CheckSquare,
          Circle,
          ArrowRight,
          ArrowLeft,
          Search,
          X,
          Pencil,
          Trash2,
          AlertCircle,
          Info,
          File,
          Compass,
          User,
          ExternalLink,
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminDashboardComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  function handleInitialRequests() {
    const bundleReq = httpMock.expectOne((r) => r.url.includes('/bundles/'));
    bundleReq.flush(mockBundles);

    component.ngOnInit();

    const overviewReq = httpMock.expectOne((r) => r.url.includes('/admin/analytics/overview'));
    overviewReq.flush(mockAnalyticsOverview);

    const realtimeReq = httpMock.expectOne((r) => r.url.includes('/admin/analytics/realtime'));
    realtimeReq.flush({ configured: true, active_users_now: 5, top_active_pages: [] });

    const topContentReq = httpMock.expectOne((r) => r.url.includes('/admin/analytics/top-content'));
    topContentReq.flush([
      { path: '/artigos/alianca', title: 'Artigo da Aliança', views: 500, users: 400 },
    ]);

    const trafficReq = httpMock.expectOne((r) => r.url.includes('/admin/analytics/traffic-sources'));
    trafficReq.flush([{ source: 'Google', sessions: 600, percentage: 50 }]);
  }

  it('should create component and load bundles and analytics on init', () => {
    handleInitialRequests();

    expect(component).toBeTruthy();
    expect(component.bundles().length).toBe(2);
    expect(component.analyticsOverview()?.summary.active_users).toBe(1420);
    expect(component.realtimeAnalytics()?.active_users_now).toBe(5);
  });

  it('should calculate stats correctly', () => {
    handleInitialRequests();

    const stats = component.stats();
    expect(stats.total).toBe(2);
    expect(stats.active).toBe(1);
    expect(stats.draft).toBe(1);
  });

  it('should filter bundles by search term', () => {
    handleInitialRequests();

    component.searchTerm.set('Aliança');
    expect(component.filteredBundles().length).toBe(1);
    expect(component.filteredBundles()[0].id).toBe('bundle-1');

    component.searchTerm.set('#11');
    expect(component.filteredBundles().length).toBe(1);
    expect(component.filteredBundles()[0].id).toBe('bundle-2');

    component.clearSearch();
    expect(component.filteredBundles().length).toBe(2);
  });

  it('should filter bundles by status', () => {
    handleInitialRequests();

    component.setStatusFilter('active');
    expect(component.filteredBundles().length).toBe(1);
    expect(component.filteredBundles()[0].is_active).toBeTrue();

    component.setStatusFilter('draft');
    expect(component.filteredBundles().length).toBe(1);
    expect(component.filteredBundles()[0].is_active).toBeFalse();

    component.setStatusFilter('all');
    expect(component.filteredBundles().length).toBe(2);
  });

  it('should toggle bundle status', () => {
    handleInitialRequests();

    component.toggleStatus(mockBundles[1]);
    expect(component.togglingStatusId()).toBe('bundle-2');

    const putReq = httpMock.expectOne(`${environment.apiUrl}/bundles/bundle-2`);
    expect(putReq.request.method).toBe('PUT');
    expect(putReq.request.body).toEqual({ is_active: true });
    putReq.flush({ ...mockBundles[1], is_active: true });

    expect(component.togglingStatusId()).toBeNull();
    const updated = component.bundles().find((b) => b.id === 'bundle-2');
    expect(updated?.is_active).toBeTrue();
  });

  it('should manage deletion confirmation modal', () => {
    handleInitialRequests();

    component.confirmDelete(mockBundles[0]);
    expect(component.bundleToDelete()?.id).toBe('bundle-1');

    component.cancelDelete();
    expect(component.bundleToDelete()).toBeNull();

    // Re-open and execute delete
    component.confirmDelete(mockBundles[0]);
    component.executeDelete();
    expect(component.isDeleting()).toBeTrue();

    const delReq = httpMock.expectOne(`${environment.apiUrl}/bundles/bundle-1`);
    expect(delReq.request.method).toBe('DELETE');
    delReq.flush({ success: true });

    const reloadReq = httpMock.expectOne((r) => r.url.includes('/bundles/'));
    reloadReq.flush([mockBundles[1]]);

    expect(component.bundleToDelete()).toBeNull();
    expect(component.isDeleting()).toBeFalse();
    expect(component.bundles().length).toBe(1);
  });

  it('should open and close analytics modal and setup modal', () => {
    handleInitialRequests();

    expect(component.analyticsModalOpen()).toBeFalse();
    component.openAnalyticsModal();
    expect(component.analyticsModalOpen()).toBeTrue();
    component.closeAnalyticsModal();
    expect(component.analyticsModalOpen()).toBeFalse();

    expect(component.analyticsSetupOpen()).toBeFalse();
    component.openAnalyticsSetup();
    expect(component.analyticsSetupOpen()).toBeTrue();
    component.closeAnalyticsSetup();
    expect(component.analyticsSetupOpen()).toBeFalse();
  });

  it('should format duration correctly', () => {
    handleInitialRequests();

    expect(component.formatDuration(185)).toBe('3m 05s');
    expect(component.formatDuration(59)).toBe('0m 59s');
  });
});
