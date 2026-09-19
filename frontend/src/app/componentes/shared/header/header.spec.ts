import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import {
  LucideAngularModule,
  Menu,
  X,
  Home,
  BookOpen,
  Heart,
  ChevronDown,
  ChevronRight,
  Video,
  FileText,
  Map,
  Info,
  Mail,
  Youtube,
  Instagram,
} from 'lucide-angular';

import { Header } from './header';

describe('Header', () => {
  let component: Header;
  let fixture: ComponentFixture<Header>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        Header,
        LucideAngularModule.pick({
          Menu,
          X,
          Home,
          BookOpen,
          Heart,
          ChevronDown,
          ChevronRight,
          Video,
          FileText,
          Map,
          Info,
          Mail,
          Youtube,
          Instagram,
        }),
      ],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Header);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open and close bottom sheet', () => {
    expect(component.isBottomSheetOpen()).toBeFalse();

    component.openBottomSheet();
    expect(component.isBottomSheetOpen()).toBeTrue();

    component.closeBottomSheet();
    expect(component.isBottomSheetOpen()).toBeFalse();
  });

  it('should open bottom sheet with accordion expanded when requested', () => {
    component.openBottomSheet(true);
    expect(component.isBottomSheetOpen()).toBeTrue();
    expect(component.isAccordionOpen()).toBeTrue();
  });

  it('should toggle accordion state', () => {
    expect(component.isAccordionOpen()).toBeFalse();
    component.toggleAccordion();
    expect(component.isAccordionOpen()).toBeTrue();
    component.toggleAccordion();
    expect(component.isAccordionOpen()).toBeFalse();
  });

  it('should close bottom sheet on escape key', () => {
    component.openBottomSheet();
    expect(component.isBottomSheetOpen()).toBeTrue();

    component.onEscapePressed();
    expect(component.isBottomSheetOpen()).toBeFalse();
  });
});
