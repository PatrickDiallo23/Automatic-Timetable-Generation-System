import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConstraintDialogComponent } from './constraint-dialog.component';

describe('ConstraintDialogComponent', () => {
  let component: ConstraintDialogComponent;
  let fixture: ComponentFixture<ConstraintDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConstraintDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConstraintDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
