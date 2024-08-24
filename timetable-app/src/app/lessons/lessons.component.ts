import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { CoreService } from '../core/core.service';
import { LessonService } from './lesson.service';
import { LessonDialogComponent } from './lesson-dialog/lesson-dialog.component';
import { Lesson } from '../model/timetableEntities';

@Component({
  selector: 'app-lessons',
  templateUrl: './lessons.component.html',
  styleUrls: ['./lessons.component.css'],
})
export class LessonsComponent implements OnInit {

  // newLesson: Lesson = {};
  dataSource = new MatTableDataSource<Lesson>([]);
  displayedColumns: string[] = [
    'subject',
    'teacher',
    'studentGroup',
    'lessonType',
    'year',
    'duration',
    'action',
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  // @ViewChild(MatTable) table!: MatTable<Room>;

  constructor(
    private lessonService: LessonService,
    private dialog: MatDialog,
    private coreService: CoreService
  ) {}

  ngOnInit(): void {
    this.loadLessons();
  }

  // credit: https://github.com/Tariqu/angular-crud-app/blob/master/src/app/services/employee.service.ts
  openAddEditLessonForm() {
    const dialogRef = this.dialog.open(LessonDialogComponent);
    dialogRef.afterClosed().subscribe({
      next: (val) => {
        if (val) {
          console.log(val);
          this.loadLessons();
        }
      },
    });
  }

  deleteLesson(id: number) {
    this.lessonService.deleteLesson(id).subscribe({
      next: (res) => {
        this.coreService.openSnackBar('Lessons deleted!', 'done');
        this.loadLessons();
      },
      error: console.log,
    });
  }

  openEditForm(data: any) {
    const dialogRef = this.dialog.open(LessonDialogComponent, {
      data,
    });

    dialogRef.afterClosed().subscribe({
      next: (val) => {
        if (val) {
          this.loadLessons();
        }
      },
    });
  }

  // addLessons() {
  //   this.lessonService
  //     .createLesson(this.newLesson)
  //     .subscribe((createdLesson) => {
  //       this.dataSource.data = [...this.dataSource.data, createdLesson];
  //       // this.table.renderRows();
  //       this.newLesson = {};
  //     });
  // }

  loadLessons() {
    this.lessonService.getAllLessons().subscribe((lessons) => {
      this.dataSource.data = lessons;
      console.log(lessons);
      this.dataSource.paginator = this.paginator;
    });
  }
}
