import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeacherDialogComponent } from './teacher-dialog.component';

describe('TeacherDialogComponent', () => {
  let component: TeacherDialogComponent;
  let fixture: ComponentFixture<TeacherDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TeacherDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeacherDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
