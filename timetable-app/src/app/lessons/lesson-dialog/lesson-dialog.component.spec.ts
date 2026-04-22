import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LessonDialogComponent } from './lesson-dialog.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('LessonDialogComponent', () => {
  let component: LessonDialogComponent;
  let fixture: ComponentFixture<LessonDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      schemas: [NO_ERRORS_SCHEMA],
      providers: [ { provide: MAT_DIALOG_DATA, useValue: {} }, { provide: MatDialogRef, useValue: {} } ],
      imports: [ HttpClientTestingModule, MatDialogModule, MatSnackBarModule, RouterTestingModule, FormsModule, ReactiveFormsModule, MatAutocompleteModule, MatSelectModule, MatInputModule, MatSlideToggleModule, NoopAnimationsModule ],
      declarations: [ LessonDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LessonDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
