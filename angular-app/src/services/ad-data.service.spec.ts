import { TestBed } from '@angular/core/testing';
import { AdDataService } from './ad-data-service';

describe('AdDataService', () => {
  let service: AdDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
