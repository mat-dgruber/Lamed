import { TestBed } from '@angular/core/testing';
import { VideosService } from './videos.service';
import { VideoService, Video } from './video.service';
import { of } from 'rxjs';

describe('VideosService', () => {
  let service: VideosService;
  let videoServiceSpy: jasmine.SpyObj<VideoService>;

  const mockVideos: Video[] = [
    {
      id: 'youtube_id_123',
      title: 'Test Video 1',
      description: 'Description 1',
      url: 'https://youtube.com/watch?v=youtube_id_123',
      provider: 'youtube',
      thumbnail_url: 'https://img.youtube.com/vi/youtube_id_123/hqdefault.jpg',
      published_at: '2026-06-18T10:00:00.000Z',
      is_active: true,
      author: 'Lamed',
    },
    {
      id: 'gen_456',
      title: 'Test Video 2',
      description: 'Description 2',
      url: 'https://youtu.be/extracted_id_456?si=some-ref',
      provider: 'youtube',
      thumbnail_url: 'https://img.youtube.com/vi/extracted_id_456/hqdefault.jpg',
      published_at: '2026-06-18T11:00:00.000Z',
      is_active: true,
      author: 'Lamed',
    }
  ];

  beforeEach(() => {
    videoServiceSpy = jasmine.createSpyObj('VideoService', ['getVideos']);
    videoServiceSpy.getVideos.and.returnValue(of(mockVideos));

    TestBed.configureTestingModule({
      providers: [
        VideosService,
        { provide: VideoService, useValue: videoServiceSpy }
      ]
    });
    service = TestBed.inject(VideosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should adapt videos properly including YouTube ID extractions and Dates', (done) => {
    service.getVideos().subscribe((adapted) => {
      expect(videoServiceSpy.getVideos).toHaveBeenCalledWith(50, undefined, true, false);
      expect(adapted.length).toBe(2);

      // First video - keeps direct ID
      expect(adapted[0].id.videoId).toBe('youtube_id_123');
      expect(adapted[0].snippet.title).toBe('Test Video 1');
      expect(adapted[0].snippet.publishedAt).toBeInstanceOf(Date);
      expect(adapted[0].snippet.publishedAt?.toISOString()).toBe('2026-06-18T10:00:00.000Z');

      // Second video - extracts ID from youtu.be URL
      expect(adapted[1].id.videoId).toBe('extracted_id_456');
      expect(adapted[1].snippet.title).toBe('Test Video 2');
      done();
    });
  });

  it('should request shorts when isShort is true', (done) => {
    const mockShorts: Video[] = [
      {
        id: 'short_789',
        title: 'Test Short 1 #shorts',
        description: 'Short description',
        url: 'https://youtube.com/shorts/short_789',
        provider: 'youtube',
        thumbnail_url: 'https://img.youtube.com/vi/short_789/hqdefault.jpg',
        published_at: '2026-06-18T12:00:00.000Z',
        is_active: true,
        is_short: true,
        author: 'Lamed',
      }
    ];
    videoServiceSpy.getVideos.and.returnValue(of(mockShorts));

    service.getVideos(true).subscribe((adapted) => {
      expect(videoServiceSpy.getVideos).toHaveBeenCalledWith(50, undefined, true, true);
      expect(adapted.length).toBe(1);
      expect(adapted[0].id.videoId).toBe('short_789');
      done();
    });
  });
});

