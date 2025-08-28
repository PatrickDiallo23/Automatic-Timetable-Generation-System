import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BenchmarkDialogComponent } from './benchmark-dialog.component';

describe('BenchmarkDialogComponent', () => {
  let component: BenchmarkDialogComponent;
  let fixture: ComponentFixture<BenchmarkDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BenchmarkDialogComponent]
    });
    fixture = TestBed.createComponent(BenchmarkDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
