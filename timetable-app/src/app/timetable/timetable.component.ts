import { Component, OnInit } from '@angular/core';
import { User } from '../model/user';
import { LoginService } from '../login/login.service';
import { TimetableService } from './timetable.service';
import { Data, HardMediumSoftScore, Lesson, Room, SemiGroup, Timeslot, Timetable } from '../model/timetableEntities';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Observable, map, startWith } from 'rxjs';
import { FormControl, FormGroup } from '@angular/forms';
import { ScoreAnalysisDialogComponent } from './score-analysis-dialog/score-analysis-dialog.component';


@Component({
  selector: 'app-timetable',
  templateUrl: './timetable.component.html',
  styleUrls: ['./timetable.component.css'],
})
export class TimetableComponent implements OnInit {

  user: User = {};
  connectedUser: User = {};
  jobId?: string | null;
  timetableData: Timetable = {};
  lessonsData: Data = {
    timeslots: [],
    rooms: [],
    lessons: [],
  };
  originalLessonsData: Data = {
    timeslots: [],
    rooms: [],
    lessons: [],
  };
  score?: HardMediumSoftScore;
  toggle: string = 'student';

  selectedStudentGroup?: string;
  selectedSemiGroup?: string;
  studentGroups: string[] = [];
  filteredStudentGroups?: Observable<string[]>;

  teachers: string[] = [];
  filteredTeachers?: Observable<string[]>;

  displayedColumns: string[] = ['subject', 'teacher', 'dayTime', 'room'];
  displayedTimetable: Lesson[] = [];
  studentGroupFormGroup = new FormGroup({
    studentGroupControl: new FormControl(''),
  });
  teacherFormGroup = new FormGroup({
    teacherControl: new FormControl(''),
  });

  //todo: filter timetable on day and student series
  //persist timetable result so that it can be used by admin and USER (student or teacher) - did this with cookies

  constructor(
    private loginService: LoginService,
    private timetableService: TimetableService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    if (Object.keys(this.user).length == 0) {
      this.loginService.getUserDetails().subscribe((userData) => {
        this.user.email = userData.email;
        this.user.role = userData.role;
      });
    }
    this.user.email = this.loginService.userConnected.email;
    this.user.role = this.loginService.userConnected.role;
    // this.timetableService.getJobId().subscribe((msg) => this.jobId = msg)
    this.jobId = localStorage.getItem('jobId');
    if (this.jobId != null && this.jobId != '') {
      console.log(this.jobId);
      this.timetableService.getTimetable(this.jobId).subscribe((timetable) => {
        this.timetableData = timetable;
        console.log('Timetable generated:');
        console.log(this.timetableData);
        this.score = this.timetableData.score;
        console.log(this.score);
        // Populate student groups
        this.populateStudentGroups();

        // Filter timetable initially
        this.filterTimetable('', '');
      });
    }
    this.filteredStudentGroups = this.studentGroupFormGroup.controls[
      'studentGroupControl'
    ].valueChanges.pipe(
      startWith(''),
      map((value) => this._filterStudents(value || ''))
    );
    this.filteredTeachers = this.teacherFormGroup.controls[
      'teacherControl'
    ].valueChanges.pipe(
      startWith(''),
      map((value) => this._filterTeachers(value || ''))
    );
  }

  isAdmin(user: User): boolean {
    if (user.role === 'ADMIN') {
      return true;
    } else {
      return false;
    }
  }

  filterTimetable(studentGroup: string, studentSemiGroup: string) {
    if (studentGroup && studentSemiGroup) {
      const selectedStudentGroup = studentGroup;

      const selectedSemiGroup = studentSemiGroup;

      console.log(selectedStudentGroup);

      const filteredTimetable = this.timetableData?.lessons?.filter(
        (lesson) =>
          lesson.studentGroup.studentGroup === selectedStudentGroup &&
          lesson.studentGroup.semiGroup === selectedSemiGroup
      );

      console.log(filteredTimetable);

      this.displayTimetable(filteredTimetable);
    }
  }

  displayTimetable(lessons: Lesson[] | undefined) {
    const timetableContainer = document.getElementById('timetable');
    if (timetableContainer) timetableContainer.innerHTML = ''; // Clear previous content

    const dayOrder = {
      MONDAY: 1,
      TUESDAY: 2,
      WEDNESDAY: 3,
      THURSDAY: 4,
      FRIDAY: 5,
    };

    const table = document.createElement('table');
    table.classList.add('timetable-table');

    // Create table header
    const headerRow = table.insertRow(0);
    headerRow.innerHTML =
      '<th>Subject</th><th>Teacher</th><th>Day and Time</th><th>Room and Building</th>';

    const sortedTimetable = lessons?.sort((a, b) => {
      const timeslotA = this.timetableData?.timeslots?.find(
        (slot) => slot.id === a.timeslot
      );
      const timeslotB = this.timetableData?.timeslots?.find(
        (slot) => slot.id === b.timeslot
      );

      if (timeslotA && timeslotB) {
        const dayOrderA =
          dayOrder[timeslotA.dayOfWeek as keyof typeof dayOrder];
        console.log(dayOrderA);
        const dayOrderB =
          dayOrder[timeslotB.dayOfWeek as keyof typeof dayOrder];
        console.log(dayOrderB);

        if (dayOrderA !== dayOrderB) {
          return dayOrderA - dayOrderB;
        } else {
          return (timeslotA.startTime ?? '').localeCompare(
            timeslotB.startTime ?? ''
          );
        }
      }
      return 0; // Default return value if timeslots are not found
    });

    console.log(sortedTimetable);
    sortedTimetable?.forEach((lesson) => {
      const timeslot = this.timetableData?.timeslots?.find(
        (slot) => slot.id === lesson.timeslot
      );
      const room = this.timetableData?.rooms?.find((r) => r.id === lesson.room);

      const row = table.insertRow();
      row.innerHTML = `<td> ${lesson.subject} - ${lesson.lessonType}</td>
                   <td>${lesson.teacher.name}</td>
                   <td>${timeslot?.dayOfWeek} ${timeslot?.startTime}-${timeslot?.endTime}</td>
                   <td>${room?.name} - ${room?.building}</td>`;
    });
    timetableContainer?.appendChild(table);
  }

  populateStudentGroups() {
    const lessons = this.timetableData?.lessons;
    if (!lessons) {
      this.studentGroups = [];
      return;
    }

    const groupSet = new Set<string>();

    lessons.forEach((lesson) => {
      const groupName = lesson.studentGroup?.studentGroup;
      if (groupName) {
        groupSet.add(groupName);
      }
    });

    this.studentGroups = Array.from(groupSet);
    console.log(this.studentGroups);
  }

  populateTeachers() {
    const lessons = this.timetableData?.lessons;
    if (!lessons) {
      this.teachers = [];
      return;
    }

    const teacherSet = new Set<string>();

    lessons.forEach((lesson) => {
      const teacherName = lesson.teacher?.name;
      if (teacherName) {
        teacherSet.add(teacherName);
      }
    });

    this.teachers = Array.from(teacherSet).sort((a, b) => a.localeCompare(b));
    console.log(this.teachers);
  }

  filterTeachers(teacher: string) {
    if (teacher) {
      const selectedTeacher = teacher;

      const filteredTimetable = this.timetableData?.lessons?.filter(
        (lesson) => lesson.teacher.name === selectedTeacher
      );

      console.log(filteredTimetable);

      this.displayTeacherTimetable(filteredTimetable);
    }
  }

  displayTeacherTimetable(lessons: Lesson[] | undefined) {
    const timetableContainer = document.getElementById('timetable');
    if (timetableContainer) timetableContainer.innerHTML = ''; // Clear previous content

    const dayOrder = {
      MONDAY: 1,
      TUESDAY: 2,
      WEDNESDAY: 3,
      THURSDAY: 4,
      FRIDAY: 5,
    };

    const table = document.createElement('table');
    table.classList.add('timetable-table');

    // Create table header
    const headerRow = table.insertRow(0);
    headerRow.innerHTML =
      '<th>Student Group</th><th>Subject</th><th>Day and Time</th><th>Room and Building</th>';

    const sortedTimetable = lessons?.sort((a, b) => {
      const timeslotA = this.timetableData?.timeslots?.find(
        (slot) => slot.id === a.timeslot
      );
      const timeslotB = this.timetableData?.timeslots?.find(
        (slot) => slot.id === b.timeslot
      );

      if (timeslotA && timeslotB) {
        const dayOrderA =
          dayOrder[timeslotA.dayOfWeek as keyof typeof dayOrder];
        console.log(dayOrderA);
        const dayOrderB =
          dayOrder[timeslotB.dayOfWeek as keyof typeof dayOrder];
        console.log(dayOrderB);

        if (dayOrderA !== dayOrderB) {
          return dayOrderA - dayOrderB;
        } else {
          return (timeslotA.startTime ?? '').localeCompare(
            timeslotB.startTime ?? ''
          );
        }
      }
      return 0; // Default return value if timeslots are not found
    });

    console.log(sortedTimetable);
    sortedTimetable?.forEach((lesson) => {
      const timeslot = this.timetableData?.timeslots?.find(
        (slot) => slot.id === lesson.timeslot
      );
      const room = this.timetableData?.rooms?.find((r) => r.id === lesson.room);

      const row = table.insertRow();
      row.innerHTML = `<td>${lesson.studentGroup.studentGroup} - ${lesson.studentGroup.semiGroup}</td>
                         <td>${lesson.subject} - ${lesson.lessonType}</td>
                         <td>${timeslot?.dayOfWeek} ${timeslot?.startTime}-${timeslot?.endTime}</td>
                         <td>${room?.name} - ${room?.building}</td>`;
    });
    timetableContainer?.appendChild(table);
  }

  toogle(value: string) {
    this.toggle = value;
    const timetableContainer = document.getElementById('timetable');

    if (this.toggle === 'student') {
      if (timetableContainer) timetableContainer.innerHTML = '';
      this.filterTimetable('', '');
      this.populateStudentGroups();
      this.studentGroupFormGroup.controls[
        'studentGroupControl'
      ].reset();
    } else {
      //this.toggle === 'teacher'
      if (timetableContainer) timetableContainer.innerHTML = '';
      console.log(value);
      this.filterTeachers('');
      this.populateTeachers();
      this.teacherFormGroup.controls['teacherControl'].reset();
    }
  }

  private _filterStudents(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.studentGroups.filter((option) =>
      option.toLowerCase().includes(filterValue)
    );
  }

  private _filterTeachers(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.teachers.filter((option) =>
      option.toLowerCase().includes(filterValue)
    );
  }

  selectInput(event: FocusEvent): void {
    const target = event.target as HTMLInputElement;
    target.select();
  }

  openAnalysisDialog(): void {
    if (
      !this.timetableData ||
      !this.timetableData.score ||
      this.timetableData.score.initScore
    ) {
      alert('No score to analyze yet. Please first generate the timetable.');
      return;
    }

    this.timetableService
      .analyzeTimetableSolution(this.timetableData)
      .subscribe({
        next: (analysis : any) => {
          this.dialog.open(ScoreAnalysisDialogComponent, {
            width: '900px',
            data: analysis,
          });
        },
        error: (err) => {
          console.error('Analyze failed', err);
          alert('Analyze failed. See console for details.');
        },
      });
  }
}

