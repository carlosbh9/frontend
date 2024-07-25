import { TestBed } from '@angular/core/testing';

import { ServicesOpeService } from './services-ope.service';

describe('ServicesOpeService', () => {
  let service: ServicesOpeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ServicesOpeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
