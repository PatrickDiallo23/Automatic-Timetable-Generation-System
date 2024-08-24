import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentGroupDialogComponent } from './student-group-dialog.component';

describe('StudentGroupDialogComponent', () => {
  let component: StudentGroupDialogComponent;
  let fixture: ComponentFixture<StudentGroupDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StudentGroupDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentGroupDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
