import { TestBed } from '@angular/core/testing';

import { ExcelImportService } from './excel-import.service';

describe('ExcelImportService', () => {
  let service: ExcelImportService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExcelImportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
