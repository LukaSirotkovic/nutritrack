import { TestBed } from '@angular/core/testing';

import { CalorieService } from './calorie.service';

describe('CalorieService', () => {
  let service: CalorieService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CalorieService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
