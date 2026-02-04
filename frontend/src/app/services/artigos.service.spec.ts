import { TestBed } from '@angular/core/testing';

import { ArtigosService } from './artigos.service';

describe('ArtigosService', () => {
  let service: ArtigosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ArtigosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
