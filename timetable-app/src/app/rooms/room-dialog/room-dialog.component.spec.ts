import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomDialogComponent } from './room-dialog.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';

describe('RoomDialogComponent', () => {
  let component: RoomDialogComponent;
  let fixture: ComponentFixture<RoomDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      schemas: [NO_ERRORS_SCHEMA],
      providers: [ { provide: MAT_DIALOG_DATA, useValue: {} }, { provide: MatDialogRef, useValue: {} } ],
      imports: [ HttpClientTestingModule, MatDialogModule, MatSnackBarModule, RouterTestingModule ],
      declarations: [ RoomDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoomDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
