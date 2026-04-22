import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConstraintsComponent } from './constraints.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';

describe('ConstraintsComponent', () => {
  let component: ConstraintsComponent;
  let fixture: ComponentFixture<ConstraintsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      schemas: [NO_ERRORS_SCHEMA],
      providers: [ { provide: MAT_DIALOG_DATA, useValue: {} }, { provide: MatDialogRef, useValue: {} } ],
      imports: [ HttpClientTestingModule, MatDialogModule, MatSnackBarModule, RouterTestingModule ],
      declarations: [ ConstraintsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConstraintsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
