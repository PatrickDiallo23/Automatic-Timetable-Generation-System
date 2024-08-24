import { TestBed } from '@angular/core/testing';

import { StudentGroupService } from './student-group.service';

describe('StudentGroupService', () => {
  let service: StudentGroupService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StudentGroupService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
