import { TestBed } from '@angular/core/testing';

import { GourmetService } from './gourmet.service';

describe('GourmetService', () => {
  let service: GourmetService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GourmetService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
