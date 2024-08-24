import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { StudentGroupService } from '../student-group.service';
import { CoreService } from 'src/app/core/core.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SemiGroup, Year } from 'src/app/model/timetableEntities';

@Component({
  selector: 'app-student-group-dialog',
  templateUrl: './student-group-dialog.component.html',
  styleUrls: ['./student-group-dialog.component.css'],
})
export class StudentGroupDialogComponent implements OnInit {
  
  studentGroupForm: FormGroup;

  year: Year[] = [
    Year.FIRST,
    Year.SECOND,
    Year.THIRD,
    Year.FOURTH,
    Year.FIFTH,
    Year.SIXTH
  ];

  semiGroups: SemiGroup[] = [SemiGroup.SEMI_GROUP0, SemiGroup.SEMI_GROUP1, SemiGroup.SEMI_GROUP2];

  constructor(
    private fb: FormBuilder,
    private studentGroupService: StudentGroupService,
    private coreService: CoreService,
    private dialogRef: MatDialogRef<StudentGroupDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.studentGroupForm = this.fb.group({
      year: '',
      name: '',
      studentGroup: '',
      semiGroup: '',
      numberOfStudents: null, //or 0
    });
  }

  ngOnInit(): void {
    this.studentGroupForm.patchValue(this.data);
    console.log(this.data);
  }

  onFormSubmit() {
    if (this.studentGroupForm.valid) {
      if (this.data) {
        this.studentGroupService
          .updateStudentGroup(this.data.id, this.studentGroupForm.value)
          .subscribe({
            next: (val: any) => {
              this.coreService.openSnackBar('Student Group detail updated!');
              this.dialogRef.close(true);
            },
            error: (err: any) => {
              console.error(err);
            },
          });
      } else {
        this.studentGroupService
          .createStudentGroup(this.studentGroupForm.value)
          .subscribe({
            next: (val: any) => {
              this.coreService.openSnackBar('Student Group added successfully');
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
