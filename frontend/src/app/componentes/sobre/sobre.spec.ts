import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Sobre } from './sobre';
import { SeoService } from '../../core/services/seo.service';

class SeoServiceStub {
  updateTags = jasmine.createSpy('updateTags');
}

describe('Sobre', () => {
  let fixture: ComponentFixture<Sobre>;
  let component: Sobre;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Sobre],
      providers: [
        provideRouter([]),
        { provide: SeoService, useClass: SeoServiceStub }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Sobre);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should expose team members', () => {
    expect(component.teamMembers.length).toBeGreaterThan(0);
  });

  it('should toggle history expansion', () => {
    expect(component.isHistoryExpanded()).toBeFalse();
    component.toggleHistory();
    expect(component.isHistoryExpanded()).toBeTrue();
    component.toggleHistory();
    expect(component.isHistoryExpanded()).toBeFalse();
  });

  it('should open and close modal', () => {
    const member = component.teamMembers[0];
    component.openModal(member);
    expect(component.selectedMember()?.id).toBe(member.id);
    component.closeModal();
    expect(component.selectedMember()).toBeNull();
    expect(component.flippedCardId()).toBeNull();
  });

  it('first card click flips, second click opens modal', () => {
    const member = component.teamMembers[0];
    component.onCardClick(member);
    expect(component.flippedCardId()).toBe(member.id);
    expect(component.selectedMember()).toBeNull();

    component.onCardClick(member);
    expect(component.selectedMember()?.id).toBe(member.id);
  });

  it('flipping another card replaces the previous', () => {
    const a = component.teamMembers[0];
    const b = component.teamMembers[1];
    component.onCardClick(a);
    component.onCardClick(b);
    expect(component.flippedCardId()).toBe(b.id);
  });

  it('onCardKey with Enter triggers the same flow', () => {
    const member = component.teamMembers[0];
    const ev = new KeyboardEvent('keydown', { key: 'Enter' });
    spyOn(ev, 'preventDefault');
    component.onCardClick(member);
    component.onCardKey(ev, member);
    expect(ev.preventDefault).toHaveBeenCalled();
    expect(component.selectedMember()?.id).toBe(member.id);
  });

  it('tracks image errors per member', () => {
    const id = component.teamMembers[0].id;
    expect(component.hasImageError(id)).toBeFalse();
    component.onImageError(id);
    expect(component.hasImageError(id)).toBeTrue();
  });

  it('calls updateTags on init with expected shape', () => {
    const stub = TestBed.inject(SeoService) as unknown as SeoServiceStub;
    expect(stub.updateTags).toHaveBeenCalled();
    const call = stub.updateTags.calls.mostRecent().args[0];
    expect(call.title).toBe('Sobre Nós');
    expect(call.imageUrl).toContain('Fundo_Lamed-total.png');
  });
});
