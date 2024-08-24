import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ConstraintService } from '../constraint.service';
import { CoreService } from 'src/app/core/core.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-constraint-dialog',
  templateUrl: './constraint-dialog.component.html',
  styleUrls: ['./constraint-dialog.component.css'],
})
export class ConstraintDialogComponent implements OnInit {
  
  constraintForm: FormGroup;

  weight: string[] = [
    'ZERO',
    'SOFT',
    'MEDIUM',
    'HARD'
  ];

  constructor(
    private fb: FormBuilder,
    private constraintService: ConstraintService,
    private coreService: CoreService,
    private dialogRef: MatDialogRef<ConstraintDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.constraintForm = this.fb.group({
      description: '',
      weight: '',
    });
  }

  ngOnInit(): void {
    this.constraintForm.patchValue(this.data);
    console.log(this.data);
  }

  onFormSubmit() {
    if (this.constraintForm.valid) {
      if (this.data) {
        this.constraintService
          .updateConstraint(this.data.id, this.constraintForm.value)
          .subscribe({
            next: (val: any) => {
              this.coreService.openSnackBar('Constraint detail updated!');
              this.dialogRef.close(true);
            },
            error: (err: any) => {
              console.error(err);
            },
          });
      } else {
        this.constraintService
          .createConstraint(this.constraintForm.value)
          .subscribe({
            next: (val: any) => {
              this.coreService.openSnackBar('Constraint added successfully');
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
