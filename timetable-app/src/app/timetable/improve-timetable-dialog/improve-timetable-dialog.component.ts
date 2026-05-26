import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

// TODO: Define future configuration models mirroring backend capabilities 
// (e.g. from TimetableService.java: .withTerminationConfig(...), or XML overrides)
export interface SolverConfigOverride {
  // terminationConfig?: { type: 'MINUTES' | 'BEST_SCORE' | 'UNIMPROVED_TIME', value: number };
  // heuristicType?: 'ALLOCATE_ENTITY_FROM_QUEUE' | 'CHEAPEST_INSERTION';
  // localSearchType?: 'LATE_ACCEPTANCE' | 'TABU_SEARCH';
  // lateAcceptanceSize?: number;
  // entityTabuRatio?: number;
}
@Component({
  selector: 'app-improve-timetable-dialog',
  templateUrl: './improve-timetable-dialog.component.html',
  styleUrls: ['./improve-timetable-dialog.component.css']
})
export class ImproveTimetableDialogComponent {
  durationMinutes: number = 5;

  // TODO: Add config state property for UI bindings when advanced config is enabled
  // solverOverrides: SolverConfigOverride = {};

  constructor(
    public dialogRef: MatDialogRef<ImproveTimetableDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { previousDuration: number }
  ) {
    if (data && data.previousDuration) {
      this.durationMinutes = data.previousDuration;
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    if (this.durationMinutes > 0 && this.durationMinutes <= 120) {
      // TODO: Include this.solverOverrides in the returned payload when backend override is supported
      this.dialogRef.close({ 
        duration: this.durationMinutes 
        // configOverrides: this.solverOverrides
      });
    }
  }
}
