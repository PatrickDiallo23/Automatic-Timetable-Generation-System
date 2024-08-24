import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TeacherService } from '../teacher.service';
import { CoreService } from 'src/app/core/core.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TimeslotService } from 'src/app/timeslots/timeslot.service';
import { Timeslot } from 'src/app/model/timetableEntities';


@Component({
  selector: 'app-teacher-dialog',
  templateUrl: './teacher-dialog.component.html',
  styleUrls: ['./teacher-dialog.component.css'],
})
export class TeacherDialogComponent implements OnInit {
  
  teacherForm: FormGroup;

  availableTimeslots?: Timeslot[];

  constructor(
    private fb: FormBuilder,
    private teacherService: TeacherService,
    private timeslotService: TimeslotService,
    private coreService: CoreService,
    private dialogRef: MatDialogRef<TeacherDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.teacherForm = this.fb.group({
      name: '',
      timeslots: null,
    });
  }

  ngOnInit(): void {
    //TODO: solve edit method
    this.teacherForm.patchValue(this.data);
    console.log(this.teacherForm.value);
    this.timeslotService.getAllTimeslots().subscribe((timeslots) => {
      this.availableTimeslots = timeslots;
    });
  }

  onFormSubmit() {
    if (this.teacherForm.valid) {
      if (this.data) {
        this.teacherService
          .updateTeacher(this.data.id, this.teacherForm.value)
          .subscribe({
            next: (val: any) => {
              this.coreService.openSnackBar('Teacher detail updated!');
              this.dialogRef.close(true);
            },
            error: (err: any) => {
              console.error(err);
            },
          });
      } else {
        this.teacherService.createTeacher(this.teacherForm.value).subscribe({
          next: (val: any) => {
            this.coreService.openSnackBar('Teacher added successfully');
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
