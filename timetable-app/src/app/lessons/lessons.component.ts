import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { CoreService } from '../core/core.service';
import { LessonService } from './lesson.service';
import { LessonDialogComponent } from './lesson-dialog/lesson-dialog.component';
import { Lesson, LessonType, Year } from '../model/timetableEntities';

@Component({
  selector: 'app-lessons',
  templateUrl: './lessons.component.html',
  styleUrls: ['./lessons.component.css'],
})
export class LessonsComponent implements OnInit {

  newLesson: Lesson = {
    subject: '',
    teacher: {},
    studentGroup: {},
    lessonType: LessonType.COURSE, // Default value
    year: Year.FIRST,
    duration: 2,
    pinned: false
  };
  dataSource = new MatTableDataSource<Lesson>([]);
  displayedColumns: string[] = [
    'subject',
    'teacher',
    'studentGroup',
    'lessonType',
    'year',
    'duration',
    'pinned',
    'action',
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  // @ViewChild(MatTable) table!: MatTable<Room>;

  // Filter values
  filterValues: any = {
    subject: '',
    teacher: '',
    studentGroup: '',
    lessonType: '',
    year: '',
    pinned: null
  };

  constructor(
    private lessonsService: LessonService,
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
    this.lessonsService.deleteLesson(id).subscribe({
      next: (res) => {
        this.coreService.openSnackBar('Lesson deleted!', 'done');
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

  addLesson() {
    this.lessonsService.createLesson(this.newLesson).subscribe((createdLesson) => {
      this.dataSource.data = [...this.dataSource.data, createdLesson];
      this.newLesson = {
        subject: '',
        teacher: {},
        studentGroup: {},
        lessonType: LessonType.COURSE,
        year: Year.FIRST,
        duration: 2,
        pinned: false
      };
    });
  }

  loadLessons() {
    this.lessonsService.getAllLessons().subscribe((lessons) => {
      this.dataSource.data = lessons;
      console.log(lessons);
      this.dataSource.paginator = this.paginator;
      
      this.dataSource.filterPredicate = (data: Lesson, filter: string) => {
        const searchTerms = JSON.parse(filter);
        
        const subjectMatch = !searchTerms.subject || (data.subject?.toLowerCase().includes(searchTerms.subject.toLowerCase()));
        
        const teacherMatch = !searchTerms.teacher || 
                             (data.teacher?.name?.toLowerCase().includes(searchTerms.teacher.toLowerCase()));
        
        const groupMatch = !searchTerms.studentGroup || 
                           (data.studentGroup?.studentGroup?.toLowerCase().includes(searchTerms.studentGroup.toLowerCase()) || 
                            data.studentGroup?.name?.toLowerCase().includes(searchTerms.studentGroup.toLowerCase()));

        const typeMatch = !searchTerms.lessonType || (data.lessonType === searchTerms.lessonType);
        
        const yearMatch = !searchTerms.year || (data.year === searchTerms.year);
        
        const pinnedMatch = !searchTerms.pinned || (data.pinned === true);

        return Boolean(subjectMatch && teacherMatch && groupMatch && typeMatch && yearMatch && pinnedMatch);
      };
    });
  }

  applyFilter(field: string, value: any) {
    this.filterValues[field] = value;
    this.dataSource.filter = JSON.stringify(this.filterValues);

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  resetFilters() {
    this.filterValues = {
      subject: '',
      teacher: '',
      studentGroup: '',
      lessonType: '',
      year: '',
      pinned: null
    };
    this.dataSource.filter = JSON.stringify(this.filterValues);

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}
