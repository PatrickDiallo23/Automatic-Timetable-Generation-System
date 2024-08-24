import { AfterViewInit, Component, ElementRef, Inject, OnInit, Renderer2, ViewChild, ViewEncapsulation, } from '@angular/core';
import { User } from '../model/user';
import { LoginService } from '../login/login.service';
import { TimetableService } from './timetable.service';
import { Data, HardMediumSoftScore, Lesson, Room, SemiGroup, Timeslot, Timetable } from '../model/timetableEntities';
import { Router } from '@angular/router';
import { Observable, map, startWith } from 'rxjs';
import { FormControl, FormGroup } from '@angular/forms';


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
    private timetableService: TimetableService
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
        // this.populateStudentGroups();
        this.populateStudentGroups();

        // Filter timetable initially
        this.filterTimetable2('', '');
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

  // #### 1st variant ####
  filterTimetable() {
    this.displayedTimetable = [];
    if (this.selectedStudentGroup && this.selectedSemiGroup) {
      const filteredTimetable = this.timetableData?.lessons?.filter(
        (lesson) =>
          lesson.studentGroup.studentGroup === this.selectedStudentGroup &&
          lesson.studentGroup.semiGroup === this.selectedSemiGroup
      );
      console.log('this is filteredTimetable');
      console.log(filteredTimetable);

      this.displayTimetable(filteredTimetable);
    }
  }

  displayTimetable(lessons: Lesson[] | undefined) {
    // Sort the displayed timetable
    const dayOrder = {
      MONDAY: 1,
      TUESDAY: 2,
      WEDNESDAY: 3,
      THURSDAY: 4,
      FRIDAY: 5,
    };

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
    console.log('this is the sortedTimetable after sorting');
    console.log(sortedTimetable);
    // Assign timeslots and rooms to lessons
    sortedTimetable?.forEach((lesson) => {
      lesson.timeslot = this.timetableData?.timeslots?.find((slot) => {
        console.log(slot);
        console.log('slot.id===lesson.timeslot');
        console.log(slot.id === lesson.timeslot);
        return slot.id === lesson.timeslot;
      });
      lesson.room = this.timetableData?.rooms?.find((r) => {
        console.log(r);
        console.log('r.id === lesson.room');
        console.log(r.id === lesson.room);
        return r.id === lesson.room;
      });
      console.log('lesson.timeslot and lesson.room after assigning');
      console.log(lesson.timeslot);
      console.log(lesson.room);
    });

    this.displayedTimetable = sortedTimetable as Lesson[];
    console.log('this is the displayed Timetable after assigning');
    console.log(this.displayedTimetable);
  }

  // #### 2nd variant that worked###
  filterTimetable2(studentGroup: string, studentSemiGroup: string) {
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

      this.displayTimetable2(filteredTimetable);
    }
  }

  displayTimetable2(lessons: Lesson[] | undefined) {
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
    if (this.timetableData.lessons) {
      this.studentGroups = [
        ...(new Set(
          this.timetableData.lessons.map(
            (lesson) => lesson.studentGroup!.studentGroup
          )
        ) as Set<string>),
      ];
      console.log(this.studentGroups);
    }
  }

  // Function to populate the student group select element
  // possible to be deleted in future
  populateStudentGroups2() {
    const selectElement = document.getElementById('studentGroup');
    const uniqueGroups = [
      ...new Set(
        this.timetableData?.lessons?.map(
          (lesson) => lesson.studentGroup.studentGroup
        )
      ),
    ] as string[];

    uniqueGroups.forEach((group) => {
      const option = document.createElement('option');
      if (option) {
        option.value = group;
        option.textContent = group;
        selectElement?.appendChild(option);
      }
    });
  }

  populateTeachers() {
    if (this.timetableData.lessons) {
      this.teachers = [
        ...(new Set(
          this.timetableData.lessons.map((lesson) => lesson.teacher.name)
        ) as Set<string>),
      ];
      this.teachers.sort((a, b) => a.localeCompare(b));
      console.log(this.teachers);
    }
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
      this.filterTimetable2('', '');
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
}

//todo refactoring + adding autocomplete feature (todo: check if autocompletion is implemented)...
