import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Apoie } from './apoie';
import { MetaTagsService } from '../../services/meta-tags.service';

describe('Apoie', () => {
  let fixture: ComponentFixture<Apoie>;
  let component: Apoie;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Apoie],
      providers: [
        provideRouter([]),
        {
          provide: MetaTagsService,
          useValue: { updateTags: jasmine.createSpy('updateTags') }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Apoie);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should default tab to gift', () => {
    expect(component.activeTab()).toBe('gift');
  });

  it('selectTab updates active tab signal', () => {
    component.selectTab('cripto');
    expect(component.activeTab()).toBe('cripto');
    component.selectTab('done');
    expect(component.activeTab()).toBe('done');
  });

  it('should call updateTags with Apoie meta on init', () => {
    const svc = TestBed.inject(MetaTagsService) as unknown as {
      updateTags: jasmine.Spy;
    };
    expect(svc.updateTags).toHaveBeenCalled();
    const payload = svc.updateTags.calls.mostRecent().args[0];
    expect(payload.title).toContain('Apoie');
    expect(payload.imageUrl).toContain('Fundo_Lamed-total.png');
  });

  it('copyPixKey updates status to copied on success', async () => {
    const write = jasmine
      .createSpy('writeText')
      .and.returnValue(Promise.resolve());
    spyOn(navigator.clipboard, 'writeText').and.callFake(write);

    await component.copyPixKey();
    expect(write).toHaveBeenCalledWith(component.pixKey);
    expect(component.copyStatus()).toBe('copied');
  });

  it('copyPixKey updates status to error on failure', async () => {
    spyOn(navigator.clipboard, 'writeText').and.returnValue(
      Promise.reject(new Error('no clipboard'))
    );

    await component.copyPixKey();
    expect(component.copyStatus()).toBe('error');
  });
});
