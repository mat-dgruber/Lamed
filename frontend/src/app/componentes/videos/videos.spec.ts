import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Videos } from './videos';
import { VideosService } from '../../services/videos.service';
import { of } from 'rxjs';

describe('Videos', () => {
  let component: Videos;
  let fixture: ComponentFixture<Videos>;
  let videosServiceSpy: jasmine.SpyObj<VideosService>;

  beforeEach(async () => {
    videosServiceSpy = jasmine.createSpyObj('VideosService', ['getVideos']);
    videosServiceSpy.getVideos.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [Videos],
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
});

