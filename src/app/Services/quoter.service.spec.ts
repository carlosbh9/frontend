import { TestBed } from '@angular/core/testing';

import { QuoterService } from './quoter.service';

describe('QuoterService', () => {
  let service: QuoterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QuoterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
