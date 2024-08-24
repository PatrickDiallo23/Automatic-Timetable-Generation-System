import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { TeacherService } from './teacher.service';
import { MatDialog } from '@angular/material/dialog';
import { CoreService } from '../core/core.service';
import { TeacherDialogComponent } from './teacher-dialog/teacher-dialog.component';
import { PrefferedTimeslotsDialogComponent } from './preffered-timeslots-dialog/preffered-timeslots-dialog.component';
import { Teacher, Timeslot } from '../model/timetableEntities';

@Component({
  selector: 'app-teachers',
  templateUrl: './teachers.component.html',
  styleUrls: ['./teachers.component.css'],
})
export class TeachersComponent implements OnInit {

  newTeacher: Teacher = {};
  dataSource = new MatTableDataSource<Teacher>([]);
  displayedColumns: string[] = ['name', 'prefferedTimeslots', 'action'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private teacherService: TeacherService,
    private dialog: MatDialog,
    private coreService: CoreService
  ) {}

  ngOnInit(): void {
    this.loadTeachers();
  }

  // credit: https://github.com/Tariqu/angular-crud-app/blob/master/src/app/services/employee.service.ts
  openAddEditTeacherForm() {
    const dialogRef = this.dialog.open(TeacherDialogComponent);
    dialogRef.afterClosed().subscribe({
      next: (val) => {
        if (val) {
          console.log(val);
          this.loadTeachers();
        }
      },
    });
  }

  openTimeslotsDialog(timeslots: Timeslot[]) {
    this.dialog.open(PrefferedTimeslotsDialogComponent, {
      width: '500px',
      data: timeslots,
    });
  }

  deleteTeacher(id: number) {
    this.teacherService.deleteTeacher(id).subscribe({
      next: (res) => {
        this.coreService.openSnackBar('Teacher deleted!', 'done');
        this.loadTeachers();
      },
      error: (err) => {
        console.log(err);
        this.coreService.openSnackBar('Error deleting the teacher... Check if the teacher is reffered somewhere else', 'done')
      },
    });
  }

  //TODO: solve edit logic
  openEditForm(data: any) {
    const dialogRef = this.dialog.open(TeacherDialogComponent, {
      data,
    });

    dialogRef.afterClosed().subscribe({
      next: (val) => {
        if (val) {
          this.loadTeachers();
        }
      },
    });
  }

  addTeacher() {
    this.teacherService
      .createTeacher(this.newTeacher)
      .subscribe((createdTeacher) => {
        this.dataSource.data = [...this.dataSource.data, createdTeacher];
        // this.table.renderRows();
        this.newTeacher = {};
      });
  }

  loadTeachers() {
    this.teacherService.getAllTeachers().subscribe((teachers) => {
      this.dataSource.data = teachers;
      console.log(teachers);
      this.dataSource.paginator = this.paginator;
    });
  }
}
