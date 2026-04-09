import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { User } from '../model/user';
import { LoginService } from '../login/login.service';
import { CoreService } from '../core/core.service';
import { TimetableService } from './timetable.service';
import { Data, HardMediumSoftScore, Lesson, LessonType, Room, SemiGroup, Timeslot, Timetable, Year } from '../model/timetableEntities';
import { MatDialog } from '@angular/material/dialog';
import { Observable, map, startWith } from 'rxjs';
import { FormControl, FormGroup } from '@angular/forms';
import { ScoreAnalysisDialogComponent } from './score-analysis-dialog/score-analysis-dialog.component';
import { EditLessonDialogComponent, EditLessonDialogData, EditLessonDialogResult } from './edit-lesson-dialog/edit-lesson-dialog.component';
import { ImpactAnalysisDialogComponent, ImpactAnalysisDialogData, LessonChangeInfo } from './impact-analysis-dialog/impact-analysis-dialog.component';
import * as XLSX from 'xlsx';


@Component({
  selector: 'app-timetable',
  templateUrl: './timetable.component.html',
  styleUrls: ['./timetable.component.css'],
})
export class TimetableComponent implements OnInit, OnDestroy {

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
  score?: HardMediumSoftScore | null;
  toggle: string = 'student';

  selectedStudentGroup?: string;
  selectedSemiGroup?: string;
  studentGroups: string[] = [];
  filteredStudentGroups?: Observable<string[]>;

  teachers: string[] = [];
  filteredTeachers?: Observable<string[]>;

  // Advanced filter data sources
  availableDays: string[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
  availableStartTimes: string[] = [];
  availableEndTimes: string[] = [];
  availableRoomNames: string[] = [];
  availableBuildings: string[] = [];
  availableCapacities: number[] = [];
  availableSubjects: string[] = [];
  availableLessonTypes: string[] = Object.values(LessonType);
  availableYears: string[] = Object.values(Year);
  filteredAdvancedRooms?: Observable<string[]>;
  filteredAdvancedTeachers?: Observable<string[]>;
  filteredAdvancedStudentGroups?: Observable<string[]>;
  filteredAdvancedSubjects?: Observable<string[]>;
  advancedResultCount: number = 0;

  displayedColumns: string[] = ['subject', 'teacher', 'dayTime', 'room'];
  displayedTimetable: Lesson[] = [];
  studentGroupFormGroup = new FormGroup({
    studentGroupControl: new FormControl(''),
  });
  teacherFormGroup = new FormGroup({
    teacherControl: new FormControl(''),
  });
  advancedFilterForm = new FormGroup({
    dayOfWeek: new FormControl(''),
    startTime: new FormControl(''),
    endTime: new FormControl(''),
    roomName: new FormControl(''),
    building: new FormControl(''),
    capacity: new FormControl(''),
    teacherName: new FormControl(''),
    studentGroup: new FormControl(''),
    subject: new FormControl(''),
    lessonType: new FormControl(''),
    year: new FormControl(''),
    pinnedOnly: new FormControl(false),
    rulesOnly: new FormControl(false),
  });

  isLoading: boolean = false;

  // Edit functionality properties
  editHistory: EditLessonDialogResult[] = [];
  isEditMode: boolean = false;
  recentlyEditedLessonIds: Set<number> = new Set();
  private readonly TIMETABLE_STORAGE_KEY = 'timetable_session_data';
  private readonly EDIT_HISTORY_STORAGE_KEY = 'timetable_edit_history';

  // todo: filter timetable on day and student series
  // persist timetable result so that it can be used by admin and USER (student or teacher) - did this with cookies

  constructor(
    private loginService: LoginService,
    private timetableService: TimetableService,
    private coreService: CoreService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    if (Object.keys(this.user).length == 0) {
      this.loginService.getUserDetails().subscribe((userData) => {
        this.user.email = userData.email;
        this.user.role = userData.role;
      },
      (error) => {
        console.error('Error fetching user details:', error);
      });
    }
    this.user.email = this.loginService.userConnected.email;
    this.user.role = this.loginService.userConnected.role;
    // this.timetableService.getJobId().subscribe((msg) => this.jobId = msg)
    this.jobId = localStorage.getItem('jobId');
    
    // Try to load from session storage first - but only if jobId matches
    const sessionData = this.loadFromSessionStorage();
    if (sessionData && sessionData.jobId === this.jobId) {
      this.timetableData = sessionData.timetable;
      this.editHistory = sessionData.editHistory || [];
      this.recentlyEditedLessonIds = new Set(sessionData.editedLessonIds || []);
      if (typeof this.timetableData.score === 'string') {
        this.score = this.parseScore(this.timetableData.score);
      } else if (this.timetableData.score && typeof this.timetableData.score === 'object') {
        this.score = {
          initScore: this.timetableData.score.initScore ?? 0,
          hardScore: this.timetableData.score.hardScore ?? 0,
          mediumScore: this.timetableData.score.mediumScore ?? 0,
          softScore: this.timetableData.score.softScore ?? 0,
        };
      }
      this.populateStudentGroups();
      this.populateTeachers();
      this.filterTimetable('', '');
      this.isLoading = false;

    } else if (this.jobId != null && this.jobId != '') {
      console.log(this.jobId);
      this.timetableService.getTimetable(this.jobId).subscribe((timetable) => {
        this.timetableData = timetable;
        console.log('Timetable generated:');
        console.log(this.timetableData);
        if (typeof this.timetableData.score === 'string') {
          this.score = this.parseScore(this.timetableData.score);
        } else if (this.timetableData.score && typeof this.timetableData.score === 'object') {
          this.score = {
            initScore: this.timetableData.score.initScore ?? 0,
            hardScore: this.timetableData.score.hardScore ?? 0,
            mediumScore: this.timetableData.score.mediumScore ?? 0,
            softScore: this.timetableData.score.softScore ?? 0,
          };

        } else {
          this.score = null;
          console.warn('Score is missing from API response');
        }


        // Populate student groups
        this.populateStudentGroups();
        this.populateTeachers();

        // Filter timetable initially
        this.filterTimetable('', '');
        // Save to session storage
        this.saveToSessionStorage();
        this.isLoading = false;
      });
    } else {
      this.isLoading = false;
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

    // Advanced filter autocomplete sources
    this.filteredAdvancedRooms = this.advancedFilterForm.controls['roomName'].valueChanges.pipe(
      startWith(''),
      map((value) => this.availableRoomNames.filter(r => r.toLowerCase().includes((value || '').toLowerCase())))
    );
    this.filteredAdvancedTeachers = this.advancedFilterForm.controls['teacherName'].valueChanges.pipe(
      startWith(''),
      map((value) => this.teachers.filter(t => t.toLowerCase().includes((value || '').toLowerCase())))
    );
    this.filteredAdvancedStudentGroups = this.advancedFilterForm.controls['studentGroup'].valueChanges.pipe(
      startWith(''),
      map((value) => this.studentGroups.filter(g => g.toLowerCase().includes((value || '').toLowerCase())))
    );
    this.filteredAdvancedSubjects = this.advancedFilterForm.controls['subject'].valueChanges.pipe(
      startWith(''),
      map((value) => this.availableSubjects.filter(s => s.toLowerCase().includes((value || '').toLowerCase())))
    );
  }

  isAdmin(user: User): boolean {
    if (user.role === 'ADMIN') {
      return true;
    } else {
      return false;
    }
  }

  private parseScore(scoreStr: string): HardMediumSoftScore {
    const initMatch = scoreStr.match(/(-?\d+)init/);
    const hardMatch = scoreStr.match(/(-?\d+)hard/);
    const mediumMatch = scoreStr.match(/(-?\d+)medium/);
    const softMatch = scoreStr.match(/(-?\d+)soft/);

    return {
      initScore: initMatch ? parseInt(initMatch[1], 10) : 0,
      hardScore: hardMatch ? parseInt(hardMatch[1], 10) : 0,
      mediumScore: mediumMatch ? parseInt(mediumMatch[1], 10) : 0,
      softScore: softMatch ? parseInt(softMatch[1], 10) : 0,
    };
  }

  filterTimetable(studentGroup: string, studentSemiGroup: string) {
    if (studentGroup && studentSemiGroup) {
      this.isLoading = true;
      const selectedStudentGroup = studentGroup;
      const selectedSemiGroup = studentSemiGroup;



      const filteredTimetable = this.timetableData?.lessons?.filter(
        (lesson) =>
          lesson.studentGroup?.studentGroup === selectedStudentGroup &&
          lesson.studentGroup?.semiGroup === selectedSemiGroup
      );

      console.log(filteredTimetable);

      this.displayedTimetable = filteredTimetable || [];

      setTimeout(() => {
        this.displayTimetable(filteredTimetable);
        this.isLoading = false;
      }, 300);
    } else {
      // Clear timetable if no selection
      this.displayedTimetable = [];
      const timetableContainer = document.getElementById('timetable');
      if (timetableContainer) timetableContainer.innerHTML = '';
    }
  }

  displayTimetable(lessons: Lesson[] | undefined) {
    const timetableContainer = document.getElementById('timetable');
    if (timetableContainer) timetableContainer.innerHTML = ''; // Clear previous content

    if (!lessons || lessons.length === 0) {
      return; // Empty state is now handled in the template
    }

    const dayOrder = {
      MONDAY: 1,
      TUESDAY: 2,
      WEDNESDAY: 3,
      THURSDAY: 4,
      FRIDAY: 5,
    };

    const table = document.createElement('table');
    table.classList.add('timetable-table');

    // Create timetable header
    const headerRow = table.insertRow(0);
    const isAdmin = this.isAdmin(this.user);
    headerRow.innerHTML = `
      <th><i class="material-icons" style="vertical-align: middle; margin-right: 8px;">book</i>Subject & Type</th>
      <th><i class="material-icons" style="vertical-align: middle; margin-right: 8px;">person</i>Teacher</th>
      <th><i class="material-icons" style="vertical-align: middle; margin-right: 8px;">schedule</i>Day & Time</th>
      <th><i class="material-icons" style="vertical-align: middle; margin-right: 8px;">room</i>Room & Building</th>
      ${isAdmin ? '<th><i class="material-icons" style="vertical-align: middle; margin-right: 8px;">settings</i>Actions</th>' : ''}
    `;

    const sortedTimetable = lessons?.sort((a, b) => {
      const timeslotA = this.timetableData?.timeslots?.find(
        (slot) => slot.id === a.timeslot
      );
      const timeslotB = this.timetableData?.timeslots?.find(
        (slot) => slot.id === b.timeslot
      );

      if (timeslotA && timeslotB) {
        const dayOrderA = dayOrder[timeslotA.dayOfWeek as keyof typeof dayOrder];
        const dayOrderB = dayOrder[timeslotB.dayOfWeek as keyof typeof dayOrder];

        if (dayOrderA !== dayOrderB) {
          return dayOrderA - dayOrderB;
        } else {
          return (timeslotA.startTime ?? '').localeCompare(timeslotB.startTime ?? '');
        }
      }
      return 0; // Default return value if timeslots are not found
    });


    sortedTimetable?.forEach((lesson, index) => {
      const timeslot = this.timetableData?.timeslots?.find(
        (slot) => slot.id === lesson.timeslot
      );
      const room = this.timetableData?.rooms?.find((r) => r.id === lesson.room);
      const isEdited = this.isLessonEdited(lesson.id);

      const row = table.insertRow();
      if (isEdited) {
        row.classList.add('edited-row');
      }
      if (lesson.pinned) {
        row.classList.add('pinned-row');
      }
      const hasRules = lesson.appliedRuleIds && lesson.appliedRuleIds.length > 0;
      if (hasRules) {
        row.classList.add('has-rules-row');
      }
      
      row.innerHTML = `
        <td class="${isEdited ? 'edited-cell' : ''} ${lesson.pinned ? 'pinned-cell' : ''} ${hasRules ? 'has-rules-cell' : ''}">
          ${lesson.pinned ? '<div class="pinned-indicator"><i class="material-icons" title="Pinned - This lesson is locked">push_pin</i></div>' : ''}
          ${isEdited ? '<div class="edited-indicator"><i class="material-icons">edit_note</i></div>' : ''}
          <div class="lesson-content">
            <div style="font-weight: 600; color: #673ab7; margin-bottom: 4px;">
              ${lesson.subject}
            </div>
            <div style="font-size: 0.85rem; color: #666; font-style: italic;">${lesson.lessonType}</div>
          </div>
          ${lesson.pinned && !isEdited ? '<span class="pinned-badge"><i class="material-icons" style="font-size: 12px; vertical-align: middle;">lock</i> Pinned</span>' : ''}
          ${isEdited ? '<span class="edited-badge"><i class="material-icons" style="font-size: 12px; vertical-align: middle;">check_circle</i> Modified</span>' : ''}
          ${hasRules ? '<span class="rules-badge"><i class="material-icons" style="font-size: 12px; vertical-align: middle;">gavel</i> ' + lesson.appliedRuleIds!.length + ' Rule' + (lesson.appliedRuleIds!.length > 1 ? 's' : '') + '</span>' : ''}
        </td>
        <td>
          <div style="display: flex; align-items: center;">
            <i class="material-icons" style="font-size: 18px; margin-right: 8px; color: #673ab7;">account_circle</i>
            ${lesson.teacher?.name || 'N/A'}
          </div>
        </td>
        <td>
          <div style="font-weight: 500; margin-bottom: 2px;">${this.formatDay(timeslot?.dayOfWeek)}</div>
          <div style="font-size: 0.9rem; color: #666;">${timeslot?.startTime} - ${timeslot?.endTime}</div>
        </td>
        <td>
          <div style="font-weight: 500; margin-bottom: 2px;">${room?.name}</div>
          <div style="font-size: 0.85rem; color: #666;">${room?.building}</div>
        </td>
        ${isAdmin ? `
        <td class="actions-cell">
          <button class="action-btn edit-btn" data-lesson-id="${lesson.id}" title="Edit Lesson">
            <i class="material-icons">edit</i>
          </button>
          <button class="action-btn analyze-btn" data-lesson-id="${lesson.id}" title="Analyze Impact">
            <i class="material-icons">analytics</i>
          </button>
        </td>
        ` : ''}
      `;

      row.style.animation = `fadeIn 0.3s ease-in-out ${index * 0.05}s both`;
    });

    timetableContainer?.appendChild(table);

    // Attach event listeners if admin
    if (isAdmin) {
      this.attachActionButtonListeners(sortedTimetable || []);
    }
  }

  private attachActionButtonListeners(lessons: Lesson[]): void {
    // Edit buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', (event) => {
        const target = event.currentTarget as HTMLElement;
        const lessonId = parseInt(target.getAttribute('data-lesson-id') || '0', 10);
        const lesson = lessons.find(l => l.id === lessonId);
        if (lesson) {
          this.openEditLessonDialog(lesson);
        }
      });
    });

    // Analyze buttons
    document.querySelectorAll('.analyze-btn').forEach(btn => {
      btn.addEventListener('click', (event) => {
        const target = event.currentTarget as HTMLElement;
        const lessonId = parseInt(target.getAttribute('data-lesson-id') || '0', 10);
        const lesson = lessons.find(l => l.id === lessonId);
        if (lesson) {
          this.openImpactAnalysisDialog(lesson);
        }
      });
    });
  }

  formatDay(day: string | undefined): string {
      if (!day) return 'N/A';

      const dayMap: { [key: string]: string } = {
        'MONDAY': 'Monday',
        'TUESDAY': 'Tuesday',
        'WEDNESDAY': 'Wednesday',
        'THURSDAY': 'Thursday',
        'FRIDAY': 'Friday',
        'SATURDAY': 'Saturday',
        'SUNDAY': 'Sunday'
      };

      return dayMap[day] || day;
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

    this.studentGroups = Array.from(groupSet).sort();
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
      this.isLoading = true;
      const selectedTeacher = teacher;

      const filteredTimetable = this.timetableData?.lessons?.filter(
        (lesson) => lesson.teacher?.name === selectedTeacher
      );


      this.displayedTimetable = filteredTimetable || [];
      setTimeout(() => {
        this.displayTeacherTimetable(filteredTimetable);
        this.isLoading = false;
      }, 300);
    } else {
      // Clear timetable if no selection
      this.displayedTimetable = [];
      const timetableContainer = document.getElementById('timetable');
      if (timetableContainer) timetableContainer.innerHTML = '';
    }
  }

  displayTeacherTimetable(lessons: Lesson[] | undefined) {
    const timetableContainer = document.getElementById('timetable');
    if (timetableContainer) timetableContainer.innerHTML = ''; // Clear previous content

    if (!lessons || lessons.length === 0) {
      return; // Empty state is now handled in the template
    }

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
    headerRow.innerHTML = `
      <th><i class="material-icons" style="vertical-align: middle; margin-right: 8px; font-size: 18px;">groups</i>Student Group</th>
      <th><i class="material-icons" style="vertical-align: middle; margin-right: 8px; font-size: 18px;">book</i>Subject & Type</th>
      <th><i class="material-icons" style="vertical-align: middle; margin-right: 8px; font-size: 18px;">schedule</i>Day & Time</th>
      <th><i class="material-icons" style="vertical-align: middle; margin-right: 8px; font-size: 18px;">room</i>Room & Building</th>
    `;
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

        const dayOrderB =
          dayOrder[timeslotB.dayOfWeek as keyof typeof dayOrder];


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


    sortedTimetable?.forEach((lesson, index) => {
      const timeslot = this.timetableData?.timeslots?.find(
        (slot) => slot.id === lesson.timeslot
      );
      const room = this.timetableData?.rooms?.find((r) => r.id === lesson.room);

      const row = table.insertRow();
      if (lesson.pinned) {
        row.classList.add('pinned-row');
      }
      const hasRules = lesson.appliedRuleIds && lesson.appliedRuleIds.length > 0;
      if (hasRules) {
        row.classList.add('has-rules-row');
      }
      
      row.innerHTML = `
        <td class="${lesson.pinned ? 'pinned-cell' : ''} ${hasRules ? 'has-rules-cell' : ''}">
          ${lesson.pinned ? '<div class="pinned-indicator"><i class="material-icons" title="Pinned - This lesson is locked">push_pin</i></div>' : ''}
          <div style="display: flex; align-items: center;">
            <i class="material-icons" style="font-size: 18px; margin-right: 8px; color: #673ab7;">group</i>
            <div>
              <div style="font-weight: 600; color: #673ab7;">${lesson.studentGroup?.studentGroup || 'N/A'}</div>
              <div style="font-size: 0.85rem; color: #666;">Subgroup ${lesson.studentGroup?.semiGroup?.replace('SEMI_GROUP', '') || 'N/A'}</div>
            </div>
          </div>
          ${lesson.pinned ? '<span class="pinned-badge"><i class="material-icons" style="font-size: 12px; vertical-align: middle;">lock</i> Pinned</span>' : ''}
          ${hasRules ? '<span class="rules-badge"><i class="material-icons" style="font-size: 12px; vertical-align: middle;">gavel</i> ' + lesson.appliedRuleIds!.length + ' Rule' + (lesson.appliedRuleIds!.length > 1 ? 's' : '') + '</span>' : ''}
        </td>
        <td>
          <div style="font-weight: 600; color: #673ab7; margin-bottom: 4px;">${lesson.subject}</div>
          <div style="font-size: 0.85rem; color: #666; font-style: italic;">${lesson.lessonType}</div>
        </td>
        <td>
          <div style="font-weight: 500; margin-bottom: 2px;">${this.formatDay(timeslot?.dayOfWeek)}</div>
          <div style="font-size: 0.9rem; color: #666;">${timeslot?.startTime} - ${timeslot?.endTime}</div>
        </td>
        <td>
          <div style="font-weight: 500; margin-bottom: 2px;">${room?.name}</div>
          <div style="font-size: 0.85rem; color: #666;">${room?.building}</div>
        </td>
      `;

      row.style.animation = `fadeIn 0.3s ease-in-out ${index * 0.05}s both`;
    });

    timetableContainer?.appendChild(table);
  }

  toogle(value: string) {
    this.isLoading = true;
    this.toggle = value;
    const timetableContainer = document.getElementById('timetable');

    if (this.toggle === 'student') {
      if (timetableContainer) timetableContainer.innerHTML = '';
      this.filterTimetable('', '');
      this.populateStudentGroups();
      this.studentGroupFormGroup.controls[
        'studentGroupControl'
      ].reset();
      this.displayedTimetable = [];
    } else if (this.toggle === 'teacher') {
      if (timetableContainer) timetableContainer.innerHTML = '';

      this.filterTeachers('');
      this.populateTeachers();
      this.teacherFormGroup.controls['teacherControl'].reset();
      this.displayedTimetable = [];
    } else {
      // advanced
      if (timetableContainer) timetableContainer.innerHTML = '';
      this.populateAdvancedFilterOptions();
      this.advancedFilterForm.reset();
      this.advancedResultCount = 0;
      this.displayedTimetable = [];
    }
    setTimeout(() => {
      this.isLoading = false;
    }, 300);
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

  populateAdvancedFilterOptions(): void {
    if (!this.timetableData) return;

    const timeslots = this.timetableData.timeslots ?? [];
    const rooms = this.timetableData.rooms ?? [];
    const lessons = this.timetableData.lessons ?? [];

    this.availableStartTimes = [...new Set(timeslots.map(t => t.startTime).filter(Boolean))] as string[];
    this.availableEndTimes = [...new Set(timeslots.map(t => t.endTime).filter(Boolean))] as string[];
    this.availableRoomNames = [...new Set(rooms.map(r => r.name).filter(Boolean))] as string[];
    this.availableBuildings = [...new Set(rooms.map(r => r.building).filter(Boolean))] as string[];
    this.availableCapacities = [...new Set(rooms.map(r => r.capacity).filter((c): c is number => c !== undefined))].sort((a, b) => a - b);
    this.availableSubjects = [...new Set(lessons.map(l => l.subject).filter(Boolean))].sort();
  }

  applyAdvancedFilter(): void {
    if (!this.timetableData?.lessons) return;

    const f = this.advancedFilterForm.value;
    const lessons = this.timetableData.lessons;

    const filtered = lessons.filter(lesson => {
      // Resolve Timeslot if it's an ID or null
      let timeslot = lesson.timeslot;
      if (typeof timeslot === 'number') {
        timeslot = this.timetableData?.timeslots?.find(t => t.id === timeslot);
      }

      // Resolve Room if it's an ID or null
      let room = lesson.room;
      if (typeof room === 'number') {
        room = this.timetableData?.rooms?.find(r => r.id === room);
      }

      const teacher = lesson.teacher;
      const studentGroup = lesson.studentGroup;

      if (f.dayOfWeek && timeslot?.dayOfWeek !== f.dayOfWeek) return false;
      if (f.startTime && timeslot?.startTime !== f.startTime) return false;
      if (f.endTime && timeslot?.endTime !== f.endTime) return false;
      if (f.roomName && !room?.name?.toLowerCase().includes(f.roomName.toLowerCase())) return false;
      if (f.building && room?.building !== f.building) return false;
      if (f.capacity && room?.capacity !== Number(f.capacity)) return false;
      if (f.teacherName && !teacher?.name?.toLowerCase().includes(f.teacherName.toLowerCase())) return false;
      if (f.studentGroup && !studentGroup?.name?.toLowerCase().includes(f.studentGroup.toLowerCase())) return false;
      if (f.subject && !lesson.subject?.toLowerCase().includes(f.subject.toLowerCase())) return false;
      if (f.lessonType && lesson.lessonType !== f.lessonType) return false;
      if (f.year && lesson.year !== f.year) return false;
      if (f.pinnedOnly && !lesson.pinned) return false;
      if (f.rulesOnly && (!lesson.appliedRuleIds || lesson.appliedRuleIds.length === 0)) return false;

      return true;
    });

    this.advancedResultCount = filtered.length;
    this.displayAdvancedTimetable(filtered);
  }

  clearAdvancedFilters(): void {
    this.advancedFilterForm.reset();
    this.advancedResultCount = 0;
    const timetableContainer = document.getElementById('timetable');
    if (timetableContainer) timetableContainer.innerHTML = '';
    this.displayedTimetable = [];
  }

  displayAdvancedTimetable(lessons: Lesson[]): void {
    const timetableContainer = document.getElementById('timetable');
    if (!timetableContainer) return;
    timetableContainer.innerHTML = '';

    if (lessons.length === 0) {
      timetableContainer.innerHTML = `
        <div style="text-align: center; padding: 40px; color: #666;">
          <span class="material-icons" style="font-size: 48px; color: #ccc;">search_off</span>
          <p style="font-size: 1.1rem; margin-top: 12px;">No lessons match your filter criteria.</p>
        </div>`;
      return;
    }

    const table = document.createElement('table');
    table.className = 'timetable-table advanced-result-table';
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';

    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    const headers = ['Subject', 'Type', 'Teacher', 'Student Group', 'Year', 'Day', 'Time', 'Room', 'Status'];
    if (this.isAdmin(this.user)) headers.push('Actions');

    headers.forEach(h => {
      const th = document.createElement('th');
      th.textContent = h;
      th.style.cssText = 'padding: 10px 14px; text-align: left; font-weight: 600; border-bottom: 2px solid #e0e0e0; background: #f5f5f5; white-space: nowrap;';
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');

    lessons.forEach((lesson, index) => {
      const row = document.createElement('tr');
      row.style.cssText = `border-bottom: 1px solid #eee; animation: fadeIn 0.3s ease-in-out ${index * 0.03}s both;`;
      row.onmouseenter = () => row.style.background = '#f8f9fa';
      row.onmouseleave = () => row.style.background = '';

      // Resolve Timeslot if it's an ID or null
      let timeslot = lesson.timeslot;
      if (typeof timeslot === 'number') {
        timeslot = this.timetableData?.timeslots?.find(t => t.id === timeslot);
      }

      // Resolve Room if it's an ID or null
      let room = lesson.room;
      if (typeof room === 'number') {
        room = this.timetableData?.rooms?.find(r => r.id === room);
      }

      const teacher = lesson.teacher;
      const studentGroup = lesson.studentGroup;

      const pinnedBadge = lesson.pinned ? '<span style="background: #e3f2fd; color: #1565c0; padding: 2px 6px; border-radius: 4px; font-size: 0.75rem; margin-left: 4px;">📌</span>' : '';
      const rulesCount = lesson.appliedRuleIds?.length ?? 0;
      const rulesBadge = rulesCount > 0 ? `<span style="background: #fff3e0; color: #e65100; padding: 2px 6px; border-radius: 4px; font-size: 0.75rem; margin-left: 4px;">📋 ${rulesCount}</span>` : '';

      const cells = [
        `<td style="padding: 10px 14px; font-weight: 500;">${lesson.subject || '-'}</td>`,
        `<td style="padding: 10px 14px;"><span style="background: ${this.getLessonTypeColor(lesson.lessonType)}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 0.8rem;">${lesson.lessonType || '-'}</span></td>`,
        `<td style="padding: 10px 14px;">${teacher?.name || '-'}</td>`,
        `<td style="padding: 10px 14px;">
          <div style="font-weight: 500;">${studentGroup?.name || '-'}</div>
          <div style="font-size: 0.8rem; color: #666;">
            ${studentGroup?.year || ''}
            ${studentGroup?.studentGroup && studentGroup.studentGroup !== studentGroup.name ? ' • ' + studentGroup.studentGroup : ''}
            ${studentGroup?.numberOfStudents ? ' • ' + studentGroup.numberOfStudents + ' stds' : ''}
            ${studentGroup?.semiGroup ? '<br>' + studentGroup.semiGroup.replace('SEMI_GROUP', 'Subgroup ') : ''}
          </div>
        </td>`,
        `<td style="padding: 10px 14px;">${lesson.year || '-'}</td>`,
        `<td style="padding: 10px 14px;">${timeslot?.dayOfWeek || '-'}</td>`,
        `<td style="padding: 10px 14px; white-space: nowrap;">${timeslot?.startTime || '?'} - ${timeslot?.endTime || '?'}</td>`,
        `<td style="padding: 10px 14px;"><div style="font-weight: 500;">${room?.name || '-'}</div><div style="font-size: 0.8rem; color: #666;">${room?.building || ''} ${room?.capacity ? '(' + room.capacity + ' seats)' : ''}</div></td>`,
        `<td style="padding: 10px 14px;">${pinnedBadge}${rulesBadge}</td>`,
      ];

      if (this.isAdmin(this.user)) {
        cells.push(`<td style="padding: 10px 14px; white-space: nowrap;">
          <button class="adv-action-btn adv-edit-btn" data-lesson-id="${lesson.id}">Edit</button>
          <button class="adv-action-btn adv-analyze-btn" data-lesson-id="${lesson.id}">Analyze</button>
        </td>`);
      }

      row.innerHTML = cells.join('');
      tbody.appendChild(row);
    });

    table.appendChild(tbody);
    timetableContainer.appendChild(table);

    // Attach event listeners for action buttons
    if (this.isAdmin(this.user)) {
      table.querySelectorAll('.adv-edit-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const lessonId = Number((btn as HTMLElement).dataset['lessonId']);
          const lesson = lessons.find(l => l.id === lessonId);
          if (lesson) this.openEditLessonDialog(lesson);
        });
      });
      table.querySelectorAll('.adv-analyze-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const lessonId = Number((btn as HTMLElement).dataset['lessonId']);
          const lesson = lessons.find(l => l.id === lessonId);
          if (lesson) this.openImpactAnalysisDialog(lesson);
        });
      });
    }
  }

  private getLessonTypeColor(type: string): string {
    switch (type) {
      case 'COURSE': return '#1976d2';
      case 'SEMINAR': return '#388e3c';
      case 'LABORATORY': return '#f57c00';
      case 'PROJECT': return '#7b1fa2';
      default: return '#757575';
    }
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



  @ViewChild('fileInput') fileInput!: ElementRef;

  triggerImport(): void {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        try {
          const jsonContent = JSON.parse(e.target.result);
          // Handle both structure types: direct Timetable or { exportInfo, timetableData }
          const timetableData = jsonContent.timetableData || jsonContent;
          
          if (!timetableData.lessons || !Array.isArray(timetableData.lessons)) {
            throw new Error('Invalid timetable format: missing lessons array');
          }

          this.processImportedData(timetableData);
        } catch (error) {
          console.error('Error parsing JSON:', error);
          alert('Error parsing JSON file. Please ensure it is a valid timetable export.');
        }
      };
      reader.readAsText(file);
    }
    // Reset input so same file can be selected again if needed
    event.target.value = ''; 
  }

  processImportedData(data: Timetable): void {
      this.isLoading = true;
      
      // Update the solution logic to ensure score is calculated
      this.timetableService.updateTimetable(data).subscribe({
        next: (updatedTimetable) => {
          this.timetableData = updatedTimetable;
          this.jobId = 'imported-session'; // dummy ID to indicate valid session
          
          // Parse score if exists
          if (typeof this.timetableData.score === 'string') {
            this.score = this.parseScore(this.timetableData.score);
          } else if (this.timetableData.score && typeof this.timetableData.score === 'object') {
            this.score = {
                initScore: this.timetableData.score.initScore ?? 0,
                hardScore: this.timetableData.score.hardScore ?? 0,
                mediumScore: this.timetableData.score.mediumScore ?? 0,
                softScore: this.timetableData.score.softScore ?? 0,
            };
          } else {
            this.score = null;
          }

          // Populate dropdowns
          this.populateStudentGroups();
          this.populateTeachers();

          // Reset filters to show full view or clear view
          this.studentGroupFormGroup.reset();
          this.teacherFormGroup.reset();
          this.filterTimetable('', '');
          this.filterTeachers('');
          
          // Clear current display
          this.displayedTimetable = [];
          const timetableContainer = document.getElementById('timetable');
          if (timetableContainer) timetableContainer.innerHTML = '';

          this.isLoading = false;
          this.coreService.openSnackBar('Timetable imported and updated successfully!', 'done');
        },
        error: (err) => {
          console.error('Error updating imported timetable:', err);
          this.isLoading = false;
          this.coreService.openSnackBar('Error processing imported timetable.', 'error');
        }
      });
  }

  exportTimetable(): void {
      if (!this.timetableData || !this.timetableData.lessons) {
        alert('No timetable data available to export.');
        return;
      }
      try {
        // Export JSON with better formatting
        const exportData = {
          exportInfo: {
            exportDate: new Date().toISOString(),
            exportedBy: this.user.email,
            totalLessons: this.timetableData.lessons.length,
            totalRooms: this.timetableData.rooms?.length || 0,
            totalTimeslots: this.timetableData.timeslots?.length || 0
          },
          timetableData: this.timetableData
        };

        const jsonBlob = new Blob([JSON.stringify(exportData, null, 2)], {
          type: 'application/json',
        });
        const jsonUrl = URL.createObjectURL(jsonBlob);
        const jsonLink = document.createElement('a');
        jsonLink.href = jsonUrl;
        jsonLink.download = `timetable-export-${new Date().toISOString().split('T')[0]}.json`;
        jsonLink.click();
        URL.revokeObjectURL(jsonUrl);

        // Enhanced Excel export with better structure
        const lessons = this.timetableData.lessons || [];
        const timeslotMap = new Map(
          (this.timetableData.timeslots || []).map((slot) => [slot.id, slot])
        );
        const roomMap = new Map(
          (this.timetableData.rooms || []).map((room) => [room.id, room])
        );

        const excelData = lessons.map((lesson) => {
          const timeslot = timeslotMap.get(lesson.timeslot);
          const room = roomMap.get(lesson.room);
          return {
            'Subject': lesson.subject,
            'Lesson Type': lesson.lessonType,
            'Teacher': lesson.teacher?.name || 'N/A',
            'Student Group': lesson.studentGroup?.studentGroup || 'N/A',
            'Subgroup': lesson.studentGroup?.semiGroup?.replace('SEMI_GROUP', 'Subgroup ') || 'N/A',
            'Day': this.formatDay(timeslot?.dayOfWeek),
            'Start Time': timeslot?.startTime || 'N/A',
            'End Time': timeslot?.endTime || 'N/A',
            'Room': room?.name || 'N/A',
            'Building': room?.building || 'N/A',
            'Pinned': lesson.pinned ? 'Yes' : 'No',
            'Rules': lesson.appliedRuleIds?.length ? lesson.appliedRuleIds.length + ' rule(s)' : '-',
          };
        });

        const worksheet = XLSX.utils.json_to_sheet(excelData);

        // Set column widths for better formatting
        const columnWidths = [
          { wch: 20 }, // Subject
          { wch: 15 }, // Lesson Type
          { wch: 20 }, // Teacher
          { wch: 15 }, // Student Group
          { wch: 12 }, // Subgroup
          { wch: 12 }, // Day
          { wch: 12 }, // Start Time
          { wch: 12 }, // End Time
          { wch: 15 }, // Room
          { wch: 15 }, // Building
          { wch: 8 },  // Pinned
          { wch: 10 }, // Rules
        ];
        worksheet['!cols'] = columnWidths;

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Timetable');

        XLSX.writeFile(
          workbook,
          `timetable-export-${new Date().toISOString().split('T')[0]}.xlsx`
        );

        // Show success message
        this.coreService.openSnackBar("Timetable exported successfully!");

      } catch (error) {
        console.error('Export failed:', error);
        alert('Export failed. Please try again.');
      }
    }

  refreshTimetable(): void {
      this.isLoading = true;

      if (this.jobId) {
        this.timetableService.getTimetable(this.jobId).subscribe({
          next: (timetable) => {
            this.timetableData = timetable;
            if (typeof this.timetableData.score === 'string') {
              this.score = this.parseScore(this.timetableData.score);
            } else if (this.timetableData.score && typeof this.timetableData.score === 'object') {
              this.score = {
                initScore: this.timetableData.score.initScore ?? 0,
                hardScore: this.timetableData.score.hardScore ?? 0,
                mediumScore: this.timetableData.score.mediumScore ?? 0,
                softScore: this.timetableData.score.softScore ?? 0,
              };
            } else {
              this.score = null;
              console.warn('Score is missing from API response');
            }
            this.populateStudentGroups();
            this.populateTeachers();

            // Reset filters and display
            this.studentGroupFormGroup.reset();
            this.teacherFormGroup.reset();
            this.filterTimetable('', '');
            this.filterTeachers('');
            this.displayedTimetable = [];

            const timetableContainer = document.getElementById('timetable');
            if (timetableContainer) timetableContainer.innerHTML = '';

            this.isLoading = false;
          },
          error: (error) => {
            console.error('Error refreshing timetable:', error);
            this.isLoading = false;
            alert('Failed to refresh timetable. Please try again.');
          }
        });
      } else {
        this.isLoading = false;
      }
    }

  printTimetable(): void {
    const timetableContent = document.getElementById('timetable');
    if (!timetableContent || !timetableContent.innerHTML.trim()) {
      alert('Please select a group or teacher to view the timetable before printing.');
      return;
    }

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Timetable - ${this.toggle === 'student' ? 'Student' : 'Teacher'} View</title>
            <style>
              body {
                font-family: 'Roboto', Arial, sans-serif;
                margin: 20px;
                color: #333;
              }
              .header {
                text-align: center;
                margin-bottom: 30px;
                border-bottom: 2px solid #673ab7;
                padding-bottom: 20px;
              }
              .header h1 {
                color: #673ab7;
                margin: 0;
              }
              .header h2 {
                color: #666;
                margin: 10px 0;
              }
              .timetable-table {
                width: 100%;
                border-collapse: collapse;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
              }
              .timetable-table th, .timetable-table td {
                border: 1px solid #ddd;
                padding: 12px;
                text-align: left;
              }
              .timetable-table th {
                background-color: #673ab7;
                color: white;
                font-weight: bold;
              }
              .timetable-table tr:nth-child(even) {
                background-color: #f9f9f9;
              }
              @media print {
                body { margin: 0; }
                .header { page-break-after: avoid; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Academic Timetable</h1>
              <h2>${this.toggle === 'student' ? 'Student' : 'Teacher'} Schedule</h2>
              <p>Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
            </div>
            ${timetableContent.outerHTML}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  }

  // ==================== Edit Functionality Methods ====================

  ngOnDestroy(): void {
    // Save current state when component is destroyed (e.g., navigation)
    this.saveToSessionStorage();
  }

  // Session Storage Methods
  private saveToSessionStorage(): void {
    try {
      const sessionData = {
        jobId: this.jobId, // Store the jobId to validate cache
        timetable: this.timetableData,
        editHistory: this.editHistory,
        editedLessonIds: Array.from(this.recentlyEditedLessonIds),
        timestamp: Date.now(),
      };
      sessionStorage.setItem(this.TIMETABLE_STORAGE_KEY, JSON.stringify(sessionData));
    } catch (error) {
      console.error('Error saving to session storage:', error);
    }
  }

  private loadFromSessionStorage(): { jobId: string; timetable: Timetable; editHistory: EditLessonDialogResult[]; editedLessonIds: number[] } | null {
    try {
      const data = sessionStorage.getItem(this.TIMETABLE_STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        // Check if data is not too old (e.g., 24 hours)
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours
        if (Date.now() - parsed.timestamp < maxAge) {
          return parsed;
        }
        // Clear stale data
        sessionStorage.removeItem(this.TIMETABLE_STORAGE_KEY);
        console.log('Cleared stale session storage data');
      }
    } catch (error) {
      console.error('Error loading from session storage:', error);
    }
    return null;
  }

  clearSessionStorage(): void {
    sessionStorage.removeItem(this.TIMETABLE_STORAGE_KEY);
    this.editHistory = [];
    this.recentlyEditedLessonIds.clear();
    
    // Reload timetable from API to restore original state
    if (this.jobId) {
      this.isLoading = true;
      this.timetableService.getTimetable(this.jobId).subscribe({
        next: (timetable) => {
          this.timetableData = timetable;
          if (typeof this.timetableData.score === 'string') {
            this.score = this.parseScore(this.timetableData.score);
          } else if (this.timetableData.score && typeof this.timetableData.score === 'object') {
            this.score = {
              initScore: this.timetableData.score.initScore ?? 0,
              hardScore: this.timetableData.score.hardScore ?? 0,
              mediumScore: this.timetableData.score.mediumScore ?? 0,
              softScore: this.timetableData.score.softScore ?? 0,
            };
          }
          this.populateStudentGroups();
          this.populateTeachers();
          this.refreshCurrentView();
          this.isLoading = false;
          this.coreService.openSnackBar('Timetable restored to original state');
        },
        error: (error) => {
          console.error('Error reloading timetable:', error);
          this.isLoading = false;
          this.coreService.openSnackBar('Failed to restore timetable');
        }
      });
    } else {
      this.coreService.openSnackBar('Session data cleared');
    }
  }

  // Edit Lesson Dialog
  openEditLessonDialog(lesson: Lesson): void {
    const currentRoom = this.timetableData?.rooms?.find(r => r.id === lesson.room);
    const currentTimeslot = this.timetableData?.timeslots?.find(ts => ts.id === lesson.timeslot);

    const dialogData: EditLessonDialogData = {
      lesson: lesson,
      rooms: this.timetableData?.rooms || [],
      timeslots: this.timetableData?.timeslots || [],
      currentRoom: currentRoom,
      currentTimeslot: currentTimeslot,
    };

    const dialogRef = this.dialog.open(EditLessonDialogComponent, {
      width: '550px',
      data: dialogData,
      disableClose: false,
    });

    dialogRef.afterClosed().subscribe((result: EditLessonDialogResult | null) => {
      if (result) {
        this.applyLessonEdit(result);
      }
    });
  }

  private applyLessonEdit(editResult: EditLessonDialogResult): void {
    this.isLoading = true;

    // Find and update the lesson in timetableData
    const lessonIndex = this.timetableData?.lessons?.findIndex(l => l.id === editResult.lesson.id);
    if (lessonIndex !== undefined && lessonIndex >= 0 && this.timetableData?.lessons) {
      // Store previous score for comparison
      const previousScore = this.score ? { ...this.score } : null;

      // Update the lesson
      this.timetableData.lessons[lessonIndex].room = editResult.newRoom;
      this.timetableData.lessons[lessonIndex].timeslot = editResult.newTimeslot;

      // Add to edit history for undo
      this.editHistory.push(editResult);
      this.recentlyEditedLessonIds.add(editResult.lesson.id!);

      // Update timetable via API to recalculate score
      this.timetableService.updateTimetable(this.timetableData).subscribe({
        next: (updatedTimetable) => {
          this.timetableData = updatedTimetable;
          
          // Update score display
          if (typeof this.timetableData.score === 'string') {
            this.score = this.parseScore(this.timetableData.score);
          } else if (this.timetableData.score && typeof this.timetableData.score === 'object') {
            this.score = {
              initScore: this.timetableData.score.initScore ?? 0,
              hardScore: this.timetableData.score.hardScore ?? 0,
              mediumScore: this.timetableData.score.mediumScore ?? 0,
              softScore: this.timetableData.score.softScore ?? 0,
            };
          }

          // Save to session storage
          this.saveToSessionStorage();

          // Refresh the displayed timetable
          this.refreshCurrentView();
          this.isLoading = false;

          this.coreService.openSnackBar('Lesson updated successfully');
        },
        error: (error) => {
          console.error('Error updating timetable:', error);
          this.isLoading = false;
          this.coreService.openSnackBar('Failed to update lesson. Please try again.');
          
          // Revert the change
          if (this.timetableData?.lessons && lessonIndex >= 0) {
            this.timetableData.lessons[lessonIndex].room = editResult.originalRoom;
            this.timetableData.lessons[lessonIndex].timeslot = editResult.originalTimeslot;
            this.editHistory.pop();
            this.recentlyEditedLessonIds.delete(editResult.lesson.id!);
          }
        }
      });
    }
  }

  // Impact Analysis Dialog
  openImpactAnalysisDialog(lesson: Lesson): void {
    this.isLoading = true;

    // Get analysis for current timetable focusing on this lesson
    this.timetableService.analyzeTimetableSolution(this.timetableData).subscribe({
      next: (analysis: any) => {
        // Find the edit result for this lesson if it exists
        const editResult = this.editHistory.find(h => h.lesson.id === lesson.id);
        
        const currentRoom = this.timetableData?.rooms?.find(r => r.id === lesson.room);
        const currentTimeslot = this.timetableData?.timeslots?.find(ts => ts.id === lesson.timeslot);
        
        let originalRoom: Room | undefined;
        let originalTimeslot: Timeslot | undefined;
        
        if (editResult) {
          originalRoom = this.timetableData?.rooms?.find(r => r.id === editResult.originalRoom);
          originalTimeslot = this.timetableData?.timeslots?.find(ts => ts.id === editResult.originalTimeslot);
        }

        const changeInfo: LessonChangeInfo = {
          lesson: lesson,
          originalRoom: originalRoom || currentRoom,
          originalTimeslot: originalTimeslot || currentTimeslot,
          newRoom: currentRoom,
          newTimeslot: currentTimeslot,
        };

        const dialogData: ImpactAnalysisDialogData = {
          change: changeInfo,
          previousScore: null, // We don't have the previous score stored
          newScore: this.score || null,
          violations: [],
          analysisData: analysis,
          rooms: this.timetableData?.rooms || [],
          timeslots: this.timetableData?.timeslots || [],
        };

        this.dialog.open(ImpactAnalysisDialogComponent, {
          width: '700px',
          maxHeight: '80vh',
          data: dialogData,
        });

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error analyzing timetable:', error);
        this.isLoading = false;
        this.coreService.openSnackBar('Failed to analyze. Please try again.');
      }
    });
  }

  // Undo Functionality
  undoLastEdit(): void {
    if (this.editHistory.length === 0) {
      this.coreService.openSnackBar('No edits to undo');
      return;
    }

    this.isLoading = true;
    const lastEdit = this.editHistory.pop()!;

    // Find and revert the lesson
    const lessonIndex = this.timetableData?.lessons?.findIndex(l => l.id === lastEdit.lesson.id);
    if (lessonIndex !== undefined && lessonIndex >= 0 && this.timetableData?.lessons) {
      this.timetableData.lessons[lessonIndex].room = lastEdit.originalRoom;
      this.timetableData.lessons[lessonIndex].timeslot = lastEdit.originalTimeslot;

      // Remove from recently edited if no more edits for this lesson
      const stillEdited = this.editHistory.some(h => h.lesson.id === lastEdit.lesson.id);
      if (!stillEdited) {
        this.recentlyEditedLessonIds.delete(lastEdit.lesson.id!);
      }

      // Update via API
      this.timetableService.updateTimetable(this.timetableData).subscribe({
        next: (updatedTimetable) => {
          this.timetableData = updatedTimetable;
          
          if (typeof this.timetableData.score === 'string') {
            this.score = this.parseScore(this.timetableData.score);
          } else if (this.timetableData.score && typeof this.timetableData.score === 'object') {
            this.score = {
              initScore: this.timetableData.score.initScore ?? 0,
              hardScore: this.timetableData.score.hardScore ?? 0,
              mediumScore: this.timetableData.score.mediumScore ?? 0,
              softScore: this.timetableData.score.softScore ?? 0,
            };
          }

          this.saveToSessionStorage();
          this.refreshCurrentView();
          this.isLoading = false;

          this.coreService.openSnackBar('Edit undone successfully');
        },
        error: (error) => {
          console.error('Error undoing edit:', error);
          this.isLoading = false;
          this.coreService.openSnackBar('Failed to undo. Please try again.');
          
          // Re-add to history if failed
          this.editHistory.push(lastEdit);
          this.recentlyEditedLessonIds.add(lastEdit.lesson.id!);
        }
      });
    }
  }

  hasEditHistory(): boolean {
    return this.editHistory.length > 0;
  }

  getEditCount(): number {
    return this.editHistory.length;
  }

  private refreshCurrentView(): void {
    // Get current filter values and re-apply
    if (this.toggle === 'student') {
      const studentGroup = this.studentGroupFormGroup.get('studentGroupControl')?.value;
      if (studentGroup) {
        // Re-filter with current selection
        const timetableContainer = document.getElementById('timetable');
        if (timetableContainer) timetableContainer.innerHTML = '';
        
        const filteredTimetable = this.timetableData?.lessons?.filter(
          (lesson) => lesson.studentGroup.studentGroup === studentGroup
        );
        this.displayedTimetable = filteredTimetable || [];
        this.displayTimetable(filteredTimetable);
      }
    } else {
      const teacher = this.teacherFormGroup.get('teacherControl')?.value;
      if (teacher) {
        const timetableContainer = document.getElementById('timetable');
        if (timetableContainer) timetableContainer.innerHTML = '';
        
        const filteredTimetable = this.timetableData?.lessons?.filter(
          (lesson) => lesson.teacher.name === teacher
        );
        this.displayedTimetable = filteredTimetable || [];
        this.displayTeacherTimetable(filteredTimetable);
      }
    }
  }

  // Check if lesson was recently edited
  isLessonEdited(lessonId: number | undefined): boolean {
    return lessonId !== undefined && this.recentlyEditedLessonIds.has(lessonId);
  }
}
