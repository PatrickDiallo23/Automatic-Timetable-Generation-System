import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { TimeslotService } from './timeslot.service';
import { MatDialog } from '@angular/material/dialog';
import { CoreService } from '../core/core.service';
import { TimeslotDialogComponent } from './timeslot-dialog/timeslot-dialog.component';
import { Timeslot } from '../model/timetableEntities';

@Component({
  selector: 'app-timeslots',
  templateUrl: './timeslots.component.html',
  styleUrls: ['./timeslots.component.css'],
})
export class TimeslotsComponent implements OnInit {

  newTimeslot: Timeslot = {};
  dataSource = new MatTableDataSource<Timeslot>([]);
  displayedColumns: string[] = ['dayOfWeek', 'startTime', 'endTime', 'action'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private timeslotService: TimeslotService,
    private dialog: MatDialog,
    private coreService: CoreService
  ) {}

  ngOnInit(): void {
    this.loadTimeslots();
  }

  // credit: https://github.com/Tariqu/angular-crud-app/blob/master/src/app/services/employee.service.ts
  openAddEditTimeslotForm() {
    const dialogRef = this.dialog.open(TimeslotDialogComponent);
    dialogRef.afterClosed().subscribe({
      next: (val) => {
        if (val) {
          console.log(val);
          this.loadTimeslots();
        }
      },
    });
  }

  deleteTimeslot(id: number) {
    this.timeslotService.deleteTimeslot(id).subscribe({
      next: (res) => {
        this.coreService.openSnackBar('Timeslot deleted!', 'done');
        this.loadTimeslots();
      },
      error: (err) => {
        console.log(err);
        this.coreService.openSnackBar(
          'Error deleting the timeslot... Check if the timeslot is reffered somewhere else',
          'done'
        );
      },
    });
  }

  openEditForm(data: any) {
    const dialogRef = this.dialog.open(TimeslotDialogComponent, {
      data,
    });

    dialogRef.afterClosed().subscribe({
      next: (val) => {
        if (val) {
          this.loadTimeslots();
        }
      },
    });
  }

  addTimeslot() {
    this.timeslotService.createTimeslot(this.newTimeslot).subscribe((createdTimeslot) => {
      this.dataSource.data = [...this.dataSource.data, createdTimeslot];
      // this.table.renderRows();
      this.newTimeslot = {};
    });
  }

  loadTimeslots() {
    this.timeslotService.getAllTimeslots().subscribe((timeslots) => {
      this.dataSource.data = timeslots;
      console.log(timeslots);
      this.dataSource.paginator = this.paginator;
    });
  }
}


