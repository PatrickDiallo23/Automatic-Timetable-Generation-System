import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScoreAnalysisDialogComponent } from './score-analysis-dialog.component';

describe('ScoreAnalysisDialogComponent', () => {
  let component: ScoreAnalysisDialogComponent;
  let fixture: ComponentFixture<ScoreAnalysisDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ScoreAnalysisDialogComponent]
    });
    fixture = TestBed.createComponent(ScoreAnalysisDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
