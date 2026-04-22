import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { JwtInterceptor } from './jwt.interceptor';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';

describe('JwtInterceptor', () => {
  beforeEach(() => TestBed.configureTestingModule({
      schemas: [NO_ERRORS_SCHEMA],
      imports: [ HttpClientTestingModule, MatDialogModule, MatSnackBarModule, RouterTestingModule ],
    providers: [ { provide: MAT_DIALOG_DATA, useValue: {} }, { provide: MatDialogRef, useValue: {} }, 
      JwtInterceptor
      ]
  }));

  it('should be created', () => {
    const interceptor: JwtInterceptor = TestBed.inject(JwtInterceptor);
    expect(interceptor).toBeTruthy();
  });
});
