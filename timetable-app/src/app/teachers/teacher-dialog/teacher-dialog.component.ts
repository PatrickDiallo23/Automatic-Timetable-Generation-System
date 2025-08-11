import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TeacherService } from '../teacher.service';
import { CoreService } from 'src/app/core/core.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Timeslot, TeacherTimeslot } from 'src/app/model/timetableEntities';


@Component({
  selector: 'app-teacher-dialog',
  templateUrl: './teacher-dialog.component.html',
  styleUrls: ['./teacher-dialog.component.css'],
})
export class TeacherDialogComponent implements OnInit {

  teacherForm: FormGroup;
  daysOfWeek = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];

  constructor(
    private fb: FormBuilder,
    private teacherService: TeacherService,
    private coreService: CoreService,
    private dialogRef: MatDialogRef<TeacherDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.teacherForm = this.fb.group({
      name: '',
      preferredTimeslots: this.fb.array([])
    });
  }

  ngOnInit(): void {
    if (this.data) {
      this.teacherForm.patchValue({
        name: this.data.name,
      });

      // Load existing custom preferred timeslots if editing
      if (this.data.preferredTimeslots && this.data.preferredTimeslots.length > 0) {
        this.data.preferredTimeslots.forEach((timeslot: TeacherTimeslot) => {
          this.addTimeslot(timeslot);
        });
      }
    console.log(this.teacherForm.value);
    }
//     this.teacherForm.patchValue(this.data);
//     console.log(this.teacherForm.value);
  }

  get preferredTimeslots(): FormArray {
    return this.teacherForm.get('preferredTimeslots') as FormArray;
  }

  addTimeslot(timeslot?: TeacherTimeslot): void {
    const timeslotGroup = this.fb.group({
      dayOfWeek: [timeslot?.dayOfWeek || '', Validators.required],
      startTime: [timeslot?.startTime || '', Validators.required],
      endTime: [timeslot?.endTime || '', Validators.required]
    });

    this.preferredTimeslots.push(timeslotGroup);
  }

  removeTimeslot(index: number): void {
    this.preferredTimeslots.removeAt(index);
  }

  onFormSubmit() : void {
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
