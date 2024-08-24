import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrefferedTimeslotsDialogComponent } from './preffered-timeslots-dialog.component';

describe('PrefferedTimeslotsDialogComponent', () => {
  let component: PrefferedTimeslotsDialogComponent;
  let fixture: ComponentFixture<PrefferedTimeslotsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrefferedTimeslotsDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrefferedTimeslotsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
