import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LessonDialogComponent } from './lesson-dialog.component';

describe('LessonDialogComponent', () => {
  let component: LessonDialogComponent;
  let fixture: ComponentFixture<LessonDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
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
