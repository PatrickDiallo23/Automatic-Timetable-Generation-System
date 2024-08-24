import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConstraintsComponent } from './constraints.component';

describe('ConstraintsComponent', () => {
  let component: ConstraintsComponent;
  let fixture: ComponentFixture<ConstraintsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
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
