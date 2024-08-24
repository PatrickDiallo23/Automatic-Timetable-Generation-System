import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentGroupComponent } from './student-group.component';

describe('StudentGroupComponent', () => {
  let component: StudentGroupComponent;
  let fixture: ComponentFixture<StudentGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StudentGroupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
