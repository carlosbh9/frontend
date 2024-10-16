import { TestBed } from '@angular/core/testing';

import { MasterQuoterService } from './master-quoter.service';

describe('MasterQuoterService', () => {
  let service: MasterQuoterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MasterQuoterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
