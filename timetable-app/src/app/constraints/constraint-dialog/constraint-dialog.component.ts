import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ConstraintService } from '../constraint.service';
import { CoreService } from 'src/app/core/core.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CONSTRAINT_DICTIONARY, ConstraintMeta } from '../constraint.meta';

@Component({
  selector: 'app-constraint-dialog',
  templateUrl: './constraint-dialog.component.html',
  styleUrls: ['./constraint-dialog.component.css'],
})
export class ConstraintDialogComponent implements OnInit {
  
  constraintForm: FormGroup;

  allConstraints: ConstraintMeta[] = CONSTRAINT_DICTIONARY;
  availableConstraints: ConstraintMeta[] = CONSTRAINT_DICTIONARY;
  selectedMeta?: ConstraintMeta;

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
      description: [''],
      weight: [''],
    });

    this.constraintForm.get('description')?.valueChanges.subscribe(val => {
       this.selectedMeta = this.allConstraints.find(c => c.id === val);
       // Only auto-patch weight if we are making a new entry rather than editing
       if (this.selectedMeta && (!this.data || !this.data.id)) {
          this.constraintForm.patchValue({ weight: this.selectedMeta.recommendedWeight }, {emitEvent: false});
       }
    });
  }

  ngOnInit(): void {
    if (this.data && this.data.id) {
       // We are in edit mode
       this.constraintForm.patchValue(this.data);
       this.availableConstraints = this.allConstraints;
    } else {
       // We are in creation mode
       this.constraintService.getAllConstraints().subscribe((existing) => {
           const existingIds = existing.map(c => c.description);
           this.availableConstraints = this.allConstraints.filter(c => !existingIds.includes(c.id));
       });
    }
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
