import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeslotDialogComponent } from './timeslot-dialog.component';

describe('TimeslotDialogComponent', () => {
  let component: TimeslotDialogComponent;
  let fixture: ComponentFixture<TimeslotDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TimeslotDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimeslotDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
