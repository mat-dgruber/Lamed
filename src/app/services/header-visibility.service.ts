import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HeaderVisibilityService {
  private headerVisible = new BehaviorSubject<boolean>(true);
  headerVisible$ = this.headerVisible.asObservable();

  constructor() { }

  setHeaderVisibility(isVisible: boolean) {
    this.headerVisible.next(isVisible);
  }
}
