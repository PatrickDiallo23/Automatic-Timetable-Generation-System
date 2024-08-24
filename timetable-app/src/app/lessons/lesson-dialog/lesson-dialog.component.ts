import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { LessonService } from '../lesson.service';
import { CoreService } from 'src/app/core/core.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TeacherService } from 'src/app/teachers/teacher.service';
import { StudentGroupService } from 'src/app/student-group/student-group.service';
import { Observable, map, startWith } from 'rxjs';
import { LessonType, StudentGroup, Teacher, Year } from 'src/app/model/timetableEntities';

@Component({
  selector: 'app-lesson-dialog',
  templateUrl: './lesson-dialog.component.html',
  styleUrls: ['./lesson-dialog.component.css'],
})
export class LessonDialogComponent implements OnInit {

  lessonForm: FormGroup;
  filteredTeachers?: Observable<Teacher[]>;
  filteredStudentGroups?: Observable<StudentGroup[]>;

  teachers: Teacher[] = [];
  studentGroups: StudentGroup[] = [];
  year: Year[] = [
    Year.FIRST,
    Year.SECOND,
    Year.THIRD,
    Year.FOURTH,
    Year.FIFTH,
    Year.SIXTH
  ];
  lessonType: LessonType[] = [
    LessonType.COURSE,
    LessonType.LABORATORY,
    LessonType.PROJECT,
    LessonType.SEMINAR
  ];

  constructor(
    private fb: FormBuilder,
    private lessonService: LessonService,
    private teacherService: TeacherService,
    private studentGroupService: StudentGroupService,
    private coreService: CoreService,
    private dialogRef: MatDialogRef<LessonDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.lessonForm = this.fb.group({
      subject: '',
      teacher: null,
      studentGroup: null,
      lessonType: '',
      year: '',
      duration: null, // or 0
    });
  }

  ngOnInit(): void {
    this.lessonForm.patchValue(this.data);
    console.log(this.data);
    this.teacherService.getAllTeachers().subscribe((retrievedTeachers) => {
      this.teachers = retrievedTeachers;
      this.filteredTeachers = this.lessonForm.controls[
        'teacher'
      ].valueChanges.pipe(
        startWith(''),
        map((value) => {
          console.log(value);
          return this._filterTeachers(value || '');
        })
      );
    });
    this.studentGroupService
      .getAllStudentGroups()
      .subscribe((retrievedStudentGroups) => {
        this.studentGroups = retrievedStudentGroups;
        this.filteredStudentGroups = this.lessonForm.controls[
          'studentGroup'
        ].valueChanges.pipe(
          startWith(''),
          map((value) => {
            console.log(value);
            return this._filterStudentGroups(value || '');
          })
        );
      });
  }

  private _filterTeachers(value: string): Teacher[] {
    const filterValue = value.toLowerCase(); //this cause the problem because value is not a string but a Teacher
    //handle the case when value is of type Teacher (with typeof)
    return this.teachers.filter(
      (teacher) =>
        teacher.name &&
        teacher.name.toString().toLowerCase().includes(filterValue)
    );
  }

  private _filterStudentGroups(value: string): StudentGroup[] {
    const filterValue = value.toLowerCase(); //this cause the problem because value is not a string but a Student
    //handle the case when value is of type Student (with typeof)
    return this.studentGroups.filter(
      (group) =>
        group.studentGroup &&
        group.studentGroup.toString().toLowerCase().includes(filterValue)
    );
  }

  displayFnTeacher(teacher: Teacher): string {
    return teacher && teacher.name ? teacher.name : '';
  }

  displayFnStudentGroup(group: StudentGroup): string {
    return group && group.studentGroup ? group.studentGroup : '';
  }

  onFormSubmit() {
    //Todo: solve the update
    if (this.lessonForm.valid) {
      if (this.data) {
        this.lessonService
          .updateLesson(this.data.id, this.lessonForm.value)
          .subscribe({
            next: (val: any) => {
              this.coreService.openSnackBar('Lesson detail updated!');
              this.dialogRef.close(true);
            },
            error: (err: any) => {
              console.error(err);
            },
          });
      } else {
        this.lessonService.createLesson(this.lessonForm.value).subscribe({
          next: (val: any) => {
            this.coreService.openSnackBar('Lesson added successfully');
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

