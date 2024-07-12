import { TestBed } from '@angular/core/testing';

import { EntrancesService } from './entrances.service';

describe('EntrancesService', () => {
  let service: EntrancesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EntrancesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
