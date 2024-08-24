import { TestBed } from '@angular/core/testing';

import { ConstraintService } from './constraint.service';

describe('ConstraintService', () => {
  let service: ConstraintService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConstraintService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
