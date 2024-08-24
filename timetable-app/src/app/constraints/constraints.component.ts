import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { CoreService } from '../core/core.service';
import { ConstraintService } from './constraint.service';
import { ConstraintDialogComponent } from './constraint-dialog/constraint-dialog.component';
import { Constraint } from '../model/timetableEntities';

@Component({
  selector: 'app-constraints',
  templateUrl: './constraints.component.html',
  styleUrls: ['./constraints.component.css'],
})
export class ConstraintsComponent implements OnInit {
  
  newConstraint: Constraint = {};
  dataSource = new MatTableDataSource<Constraint>([]);
  displayedColumns: string[] = ['description', 'weight', 'action'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private constraintService: ConstraintService,
    private dialog: MatDialog,
    private coreService: CoreService
  ) {}

  ngOnInit(): void {
    this.loadConstraints();
  }

  // credit: https://github.com/Tariqu/angular-crud-app/blob/master/src/app/services/employee.service.ts
  openAddEditConstraintForm() {
    const dialogRef = this.dialog.open(ConstraintDialogComponent);
    dialogRef.afterClosed().subscribe({
      next: (val) => {
        if (val) {
          console.log(val);
          this.loadConstraints();
        }
      },
    });
  }

  deleteConstraint(id: number) {
    this.constraintService.deleteConstraint(id).subscribe({
      next: (res) => {
        this.coreService.openSnackBar('Constraint deleted!', 'done');
        this.loadConstraints();
      },
      error: console.log,
    });
  }

  openEditForm(data: any) {
    const dialogRef = this.dialog.open(ConstraintDialogComponent, {
      data,
    });

    dialogRef.afterClosed().subscribe({
      next: (val) => {
        if (val) {
          this.loadConstraints();
        }
      },
    });
  }

  addConstraint() {
    this.constraintService.createConstraint(this.newConstraint).subscribe((createdConstraint) => {
      this.dataSource.data = [...this.dataSource.data, createdConstraint];
      // this.table.renderRows();
      this.newConstraint = {};
    });
  }

  loadConstraints() {
    this.constraintService.getAllConstraints().subscribe((constraints) => {
      this.dataSource.data = constraints;
      this.dataSource.paginator = this.paginator;
    });
  }
}

