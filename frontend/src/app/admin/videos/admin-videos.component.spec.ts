import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AdminVideosComponent } from './admin-videos.component';
import { Video } from '../../services/video.service';
import { environment } from '../../../environments/environment';
import { LucideAngularModule, Video as VideoIcon, RefreshCw, Search, Check, X, Smartphone, ArrowLeft } from 'lucide-angular';

describe('AdminVideosComponent', () => {
  let component: AdminVideosComponent;
  let fixture: ComponentFixture<AdminVideosComponent>;
  let httpMock: HttpTestingController;

  const mockVideos: Video[] = [
    {
      id: 'vid1',
      title: 'Estudo Bíblico Completo',
      description: 'Vídeo longo sobre lição',
      url: 'https://youtube.com/watch?v=vid1',
      provider: 'youtube',
      thumbnail_url: 'https://img.youtube.com/vi/vid1/hqdefault.jpg',
      published_at: '2026-08-10T10:00:00.000Z',
      is_active: true,
      is_short: false,
      author: 'Canal Lamed',
    },
    {
      id: 'short1',
      title: 'Dica Rápida em 1 Minuto',
      description: 'Short explicativo',
      url: 'https://youtube.com/shorts/short1',
      provider: 'youtube',
      thumbnail_url: 'https://img.youtube.com/vi/short1/hqdefault.jpg',
      published_at: '2026-08-11T10:00:00.000Z',
      is_active: false,
      is_short: true,
      author: 'Canal Lamed',
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AdminVideosComponent,
        HttpClientTestingModule,
        RouterTestingModule,
        LucideAngularModule.pick({ Video: VideoIcon, RefreshCw, Search, Check, X, Smartphone, ArrowLeft }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminVideosComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create component and load videos on init', () => {
    fixture.detectChanges(); // triggers ngOnInit

    const req = httpMock.expectOne(`${environment.apiUrl}/admin/videos/`);
    expect(req.request.method).toBe('GET');
    req.flush(mockVideos);

    expect(component.videos().length).toBe(2);
    expect(component.loading()).toBeFalse();
  });

  it('should toggle video active status', () => {
    fixture.detectChanges();
    const req = httpMock.expectOne(`${environment.apiUrl}/admin/videos/`);
    req.flush(mockVideos);

    const videoToToggle = mockVideos[0];
    component.toggleActive(videoToToggle);

    const patchReq = httpMock.expectOne(`${environment.apiUrl}/admin/videos/vid1`);
    expect(patchReq.request.method).toBe('PATCH');
    expect(patchReq.request.body).toEqual({ is_active: false });

    patchReq.flush({ ...videoToToggle, is_active: false });

    const updated = component.videos().find((v) => v.id === 'vid1');
    expect(updated?.is_active).toBeFalse();
  });

  it('should toggle video short format status', () => {
    fixture.detectChanges();
    const req = httpMock.expectOne(`${environment.apiUrl}/admin/videos/`);
    req.flush(mockVideos);

    const videoToToggle = mockVideos[0];
    component.toggleShort(videoToToggle);

    const patchReq = httpMock.expectOne(`${environment.apiUrl}/admin/videos/vid1`);
    expect(patchReq.request.method).toBe('PATCH');
    expect(patchReq.request.body).toEqual({ is_short: true });

    patchReq.flush({ ...videoToToggle, is_short: true });

    const updated = component.videos().find((v) => v.id === 'vid1');
    expect(updated?.is_short).toBeTrue();
  });

  it('should trigger youtube sync and reload videos', () => {
    fixture.detectChanges();
    const initReq = httpMock.expectOne(`${environment.apiUrl}/admin/videos/`);
    initReq.flush(mockVideos);

    component.syncYoutube();
    expect(component.isSyncing()).toBeTrue();

    const syncReq = httpMock.expectOne(`${environment.apiUrl}/admin/sync-youtube`);
    expect(syncReq.request.method).toBe('POST');
    syncReq.flush({ status: 'success', data: { imported: 1 } });

    expect(component.isSyncing()).toBeFalse();

    const reloadReq = httpMock.expectOne(`${environment.apiUrl}/admin/videos/`);
    reloadReq.flush(mockVideos);
  });

  it('should filter videos by search term, type and status', () => {
    fixture.detectChanges();
    const req = httpMock.expectOne(`${environment.apiUrl}/admin/videos/`);
    req.flush(mockVideos);

    // Initial state: all
    expect(component.filteredVideos().length).toBe(2);

    // Search filter
    component.searchTerm.set('Estudo');
    expect(component.filteredVideos().length).toBe(1);
    expect(component.filteredVideos()[0].id).toBe('vid1');

    // Reset search
    component.searchTerm.set('');

    // Type filter: short
    component.filterType.set('short');
    expect(component.filteredVideos().length).toBe(1);
    expect(component.filteredVideos()[0].id).toBe('short1');

    // Type filter: video
    component.filterType.set('video');
    expect(component.filteredVideos().length).toBe(1);
    expect(component.filteredVideos()[0].id).toBe('vid1');

    // Reset type filter, test status filter: active
    component.filterType.set('all');
    component.filterStatus.set('active');
    expect(component.filteredVideos().length).toBe(1);
    expect(component.filteredVideos()[0].id).toBe('vid1');

    // Status filter: inactive
    component.filterStatus.set('inactive');
    expect(component.filteredVideos().length).toBe(1);
    expect(component.filteredVideos()[0].id).toBe('short1');
  });
});
