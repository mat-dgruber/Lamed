import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Videos } from './videos';
import { VideosService } from '../../services/videos.service';
import { of } from 'rxjs';
import { LucideAngularModule, Video, Smartphone, Youtube, ExternalLink } from 'lucide-angular';

describe('Videos', () => {
  let component: Videos;
  let fixture: ComponentFixture<Videos>;
  let videosServiceSpy: jasmine.SpyObj<VideosService>;

  beforeEach(async () => {
    videosServiceSpy = jasmine.createSpyObj('VideosService', ['getVideos']);
    videosServiceSpy.getVideos.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [Videos, LucideAngularModule.pick({ Video, Smartphone, Youtube, ExternalLink })],
      providers: [
        { provide: VideosService, useValue: videosServiceSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Videos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should default to activeTab "long"', () => {
    expect(component.activeTab()).toBe('long');
  });

  it('should switch tab to shorts and fetch shorts videos', () => {
    component.playVideo('vid123');
    expect(component.isPlaying('vid123')).toBeTrue();

    component.setTab('shorts');

    expect(component.activeTab()).toBe('shorts');
    expect(component.isPlaying('vid123')).toBeFalse();
    expect(videosServiceSpy.getVideos).toHaveBeenCalledWith(true);
  });

  it('should switch tab back to long and fetch long videos', () => {
    component.setTab('shorts');
    videosServiceSpy.getVideos.calls.reset();

    component.setTab('long');

    expect(component.activeTab()).toBe('long');
    expect(videosServiceSpy.getVideos).toHaveBeenCalledWith(false);
  });
});

