import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TimeslotService } from '../timeslot.service';
import { CoreService } from 'src/app/core/core.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-timeslot-dialog',
  templateUrl: './timeslot-dialog.component.html',
  styleUrls: ['./timeslot-dialog.component.css'],
})
export class TimeslotDialogComponent implements OnInit {
  
  timeslotForm: FormGroup;

  //TODO: solve Timeslot
  weekdays: string[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
  weekdaysMap: Map<string,number>;
bindedWeekdaysMapKeys: string[];

  

  constructor(
    private fb: FormBuilder,
    private timeslotService: TimeslotService,
    private coreService: CoreService,
    private dialogRef: MatDialogRef<TimeslotDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.weekdaysMap = new Map()
.set("MONDAY", 1)
.set("TUESDAY", 2)
.set("WEDNESDAY", 3)
.set("THURSDAY", 4)
.set("FRIDAY", 5);
 this.bindedWeekdaysMapKeys = Array.from(this.weekdaysMap.keys());
    this.timeslotForm = this.fb.group({
      dayOfWeek: '',
      startTime: '',
      endTime: '',
    });
  }

  ngOnInit(): void {
    this.timeslotForm.patchValue(this.data);
    console.log(this.data);
  }

  onFormSubmit() {
    if (this.timeslotForm.valid) {
      if (this.data) {
        //TODO: solve the update
        this.timeslotService
          .updateTimeslot(this.data.id, this.timeslotForm.value)
          .subscribe({
            next: (val: any) => {
              this.coreService.openSnackBar('Timeslot detail updated!');
              this.dialogRef.close(true);
            },
            error: (err: any) => {
              console.error(err);
            },
          });
      } else {
        this.timeslotService.createTimeslot(this.timeslotForm.value).subscribe({
          next: (val: any) => {
            this.coreService.openSnackBar('Timeslot added successfully');
            this.dialogRef.close(true);
          },
          error: (err: any) => {
            console.error(err);
          },
        });
      }
    }
  }
}
