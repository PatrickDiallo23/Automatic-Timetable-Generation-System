import { TestBed } from '@angular/core/testing';

import { TimetableService } from './timetable.service';

describe('TimetableService', () => {
  let service: TimetableService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TimetableService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
