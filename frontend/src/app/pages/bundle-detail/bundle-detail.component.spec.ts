import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BundleDetailComponent } from './bundle-detail.component';
import { BundleService, Bundle } from '../../services/bundle.service';
import { SeoService } from '../../core/services/seo.service';
import { AnalyticsService } from '../../core/services/analytics.service';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of, throwError } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { LucideAngularModule, Menu, ArrowLeft, Calendar, User, FileQuestion, ChevronUp, ChevronDown, Search, Lock, Mail, Key, Loader2, RefreshCw, Plus, LayoutList, AlertCircle, BookOpen, Library, Download, DownloadCloud, Map, Image, Monitor, Book, FileText, Headphones, File, PlayCircle, Link, Inbox, Tag, Star, Pencil, Trash2, X, Check, CheckCircle, Heart, Youtube, ExternalLink } from 'lucide-angular';

describe('BundleDetailComponent', () => {
  let component: BundleDetailComponent;
  let fixture: ComponentFixture<BundleDetailComponent>;
  let bundleServiceSpy: jasmine.SpyObj<BundleService>;
  let seoServiceSpy: jasmine.SpyObj<SeoService>;
  let analyticsServiceSpy: jasmine.SpyObj<AnalyticsService>;

  const mockBundle: Bundle = {
    id: 'test-id',
    title: 'Test Bundle',
    description: 'Test description',
    week_number: 5,
    author: 'Author Test',
    published_at: '2026-06-18T10:00:00Z',
    video_id: 'youtube_vid',
    thumbnail_url: 'https://drive.google.com/file/d/thumbnail',
    article_url: 'https://lamed148.com.br/article',
    article_content: '<p>Content</p>',
    resources: [
      { title: 'Resource 1', type: 'pdf', url: 'https://example.com/res1.pdf' }
    ],
    is_active: true,
    created_at: '2026-06-18T10:00:00Z',
    updated_at: '2026-06-18T10:00:00Z'
  };

  beforeEach(async () => {
    bundleServiceSpy = jasmine.createSpyObj('BundleService', ['getBundleById']);
    seoServiceSpy = jasmine.createSpyObj('SeoService', ['updateMetaTags', 'updateJsonLd']);
    analyticsServiceSpy = jasmine.createSpyObj('AnalyticsService', ['trackEvent']);

    bundleServiceSpy.getBundleById.and.returnValue(of(mockBundle));

    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        LucideAngularModule.pick({ Menu, ArrowLeft, Calendar, User, FileQuestion, ChevronUp, ChevronDown, Search, Lock, Mail, Key, Loader2, RefreshCw, Plus, LayoutList, AlertCircle, BookOpen, Library, Download, DownloadCloud, Map, Image, Monitor, Book, FileText, Headphones, File, PlayCircle, Link, Inbox, Tag, Star, Pencil, Trash2, X, Check, CheckCircle, Heart, Youtube, ExternalLink }),
        BundleDetailComponent
      ],
      providers: [
        { provide: BundleService, useValue: bundleServiceSpy },
        { provide: SeoService, useValue: seoServiceSpy },
        { provide: AnalyticsService, useValue: analyticsServiceSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({ id: 'test-id' }))
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BundleDetailComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load bundle details on init', () => {
    fixture.detectChanges(); // triggers ngOnInit

    expect(bundleServiceSpy.getBundleById).toHaveBeenCalledWith('test-id');
    expect(component.bundle()).toEqual(mockBundle);
    expect(component.loading()).toBeFalse();
    expect(seoServiceSpy.updateMetaTags).toHaveBeenCalled();
    expect(analyticsServiceSpy.trackEvent).toHaveBeenCalledWith('view_bundle', jasmine.any(Object));
  });

  it('should handle error when loading bundle fails', () => {
    bundleServiceSpy.getBundleById.and.returnValue(throwError(() => new Error('Error loading bundle')));
    fixture.detectChanges();

    expect(component.loading()).toBeFalse();
    expect(component.bundle()).toBeNull();
  });

  it('should process related_video_urls correctly on load', () => {
    const bundleWithRelated: Bundle = {
      ...mockBundle,
      related_video_urls: [
        'https://www.youtube.com/shorts/1234567890a',
        'https://www.youtube.com/watch?v=0987654321b'
      ]
    };
    bundleServiceSpy.getBundleById.and.returnValue(of(bundleWithRelated));

    fixture.detectChanges();

    const related = component.relatedVideos();
    expect(related.length).toBe(2);
    expect(related[0].isShort).toBeTrue();
    expect(related[0].videoId).toBe('1234567890a');
    expect(related[1].isShort).toBeFalse();
    expect(related[1].videoId).toBe('0987654321b');
  });

});

