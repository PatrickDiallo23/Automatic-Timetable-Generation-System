import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { LessonService } from '../lesson.service';
import { CoreService } from 'src/app/core/core.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TeacherService } from 'src/app/teachers/teacher.service';
import { StudentGroupService } from 'src/app/student-group/student-group.service';
import { TimeslotService } from 'src/app/timeslots/timeslot.service';
import { RoomService } from 'src/app/rooms/room.service';
import { Observable, map, startWith } from 'rxjs';
import { LessonType, Room, StudentGroup, Teacher, Timeslot, Year } from 'src/app/model/timetableEntities';

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
  timeslots: Timeslot[] = [];
  rooms: Room[] = [];
  groupedTimeslots: Map<string, Timeslot[]> = new Map();
  dayOrder = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
  
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
    private timeslotService: TimeslotService,
    private roomService: RoomService,
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
      duration: null,
      pinned: false,
      timeslot: null,
      room: null,
    });
  }

  ngOnInit(): void {
    // Patch basic form values
    if (this.data) {
      this.lessonForm.patchValue({
        subject: this.data.subject,
        teacher: this.data.teacher,
        studentGroup: this.data.studentGroup,
        lessonType: this.data.lessonType,
        year: this.data.year,
        duration: this.data.duration,
        pinned: this.data.pinned || false,
        // Extract IDs for timeslot and room - they may come as objects or IDs
        timeslot: this.data.timeslot?.id ?? this.data.timeslot ?? null,
        room: this.data.room?.id ?? this.data.room ?? null,
      });
    }
    
    // Load teachers
    this.teacherService.getAllTeachers().subscribe((retrievedTeachers) => {
      this.teachers = retrievedTeachers;
      this.filteredTeachers = this.lessonForm.controls[
        'teacher'
      ].valueChanges.pipe(
        startWith(''),
        map((value) => {
          return this._filterTeachers(value || '');
        })
      );
    });
    
    // Load student groups
    this.studentGroupService
      .getAllStudentGroups()
      .subscribe((retrievedStudentGroups) => {
        this.studentGroups = retrievedStudentGroups;
        this.filteredStudentGroups = this.lessonForm.controls[
          'studentGroup'
        ].valueChanges.pipe(
          startWith(''),
          map((value) => {
            return this._filterStudentGroups(value || '');
          })
        );
      });
    
    // Load timeslots for pinning
    this.timeslotService.getAllTimeslots().subscribe((retrievedTimeslots) => {
      this.timeslots = retrievedTimeslots;
      this.groupTimeslotsByDay();
    });
    
    // Load rooms for pinning
    this.roomService.getAllRooms().subscribe((retrievedRooms) => {
      this.rooms = retrievedRooms;
    });
  }

  private groupTimeslotsByDay(): void {
    this.groupedTimeslots = new Map();
    
    this.dayOrder.forEach(day => {
      const slots = this.timeslots
        .filter(ts => ts.dayOfWeek === day)
        .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
      
      if (slots.length > 0) {
        this.groupedTimeslots.set(day, slots);
      }
    });
  }

  formatDay(day: string | undefined): string {
    if (!day) return '';
    const dayMap: { [key: string]: string } = {
      'MONDAY': 'Monday',
      'TUESDAY': 'Tuesday',
      'WEDNESDAY': 'Wednesday',
      'THURSDAY': 'Thursday',
      'FRIDAY': 'Friday',
    };
    return dayMap[day] || day;
  }

  getTimeslotsByDay(day: string): Timeslot[] {
    return this.groupedTimeslots.get(day) || [];
  }

  private _filterTeachers(value: string): Teacher[] {
    const filterValue = value.toLowerCase();
    return this.teachers.filter(
      (teacher) =>
        teacher.name &&
        teacher.name.toString().toLowerCase().includes(filterValue)
    );
  }

  private _filterStudentGroups(value: string): StudentGroup[] {
    const filterValue = value.toLowerCase();
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
    if (this.lessonForm.valid) {
      const formValue = this.lessonForm.value;
      
      // Prepare lesson data
      const lessonData: any = {
        subject: formValue.subject,
        teacher: formValue.teacher,
        studentGroup: formValue.studentGroup,
        lessonType: formValue.lessonType,
        year: formValue.year,
        duration: formValue.duration,
        pinned: formValue.pinned || false,
      };
      
      // Include timeslot and room if pinned
      if (formValue.pinned) {
        if (formValue.timeslot) {
          lessonData.timeslot = { id: formValue.timeslot };
        }
        if (formValue.room) {
          lessonData.room = { id: formValue.room };
        }
      }
      
      if (this.data) {
        this.lessonService
          .updateLesson(this.data.id, lessonData)
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
        this.lessonService.createLesson(lessonData).subscribe({
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


