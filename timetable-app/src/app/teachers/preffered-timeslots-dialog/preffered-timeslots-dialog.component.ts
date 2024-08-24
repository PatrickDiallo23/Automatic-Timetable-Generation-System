import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Timeslot } from 'src/app/model/timetableEntities';

@Component({
  selector: 'app-preffered-timeslots-dialog',
  templateUrl: './preffered-timeslots-dialog.component.html',
  styleUrls: ['./preffered-timeslots-dialog.component.css'],
})
export class PrefferedTimeslotsDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public timeslots: Timeslot[]) {}
}
