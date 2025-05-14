import { TestBed } from '@angular/core/testing';

import { CervezaService } from './cerveza.service';

describe('CervezaService', () => {
  let service: CervezaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CervezaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
