import { TestBed } from '@angular/core/testing';

import { CalculatepricesService } from './calculateprices.service';

describe('CalculatepricesService', () => {
  let service: CalculatepricesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CalculatepricesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
