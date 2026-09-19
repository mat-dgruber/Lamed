import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { MessageService } from 'primeng/api';
import {
  LucideAngularModule,
  Sparkles,
  BookOpen,
  FileText,
  Video,
  Calendar,
  User,
  DownloadCloud,
  ArrowRight,
  ChevronRight,
  Heart,
  Youtube,
  Compass,
  ExternalLink,
  Mail,
} from 'lucide-angular';

import { Home } from './home';
import { BundleService } from '../../services/bundle.service';
import { ArticleService } from '../../services/article.service';

describe('Home', () => {
  let component: Home;
  let fixture: ComponentFixture<Home>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        Home,
        LucideAngularModule.pick({
          Sparkles,
          BookOpen,
          FileText,
          Video,
          Calendar,
          User,
          DownloadCloud,
          ArrowRight,
          ChevronRight,
          Heart,
          Youtube,
          Compass,
          ExternalLink,
          Mail,
        }),
      ],
      providers: [
        provideRouter([]),
        { provide: BundleService, useValue: { bundles: () => undefined, getBundles: () => of([]), getLatestBundle: () => of(null) } },
        { provide: ArticleService, useValue: { getArticles: () => of([]) } },
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
