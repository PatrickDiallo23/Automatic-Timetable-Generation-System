import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { LessonService } from '../lesson.service';
import { CoreService } from 'src/app/core/core.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TeacherService } from 'src/app/teachers/teacher.service';
import { StudentGroupService } from 'src/app/student-group/student-group.service';
import { TimeslotService } from 'src/app/timeslots/timeslot.service';
import { RoomService } from 'src/app/rooms/room.service';
import { Observable, map, startWith, switchMap, of, catchError } from 'rxjs';
import {
  LessonType, RestrictionRule, Room, RuleCombination,
  RuleTargetType, StudentGroup, Teacher, Timeslot, Year
} from 'src/app/model/timetableEntities';
import { RestrictionRuleService } from 'src/app/assignment-rules/restriction-rule.service';

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

  /** All available restriction rules, loaded on init */
  allRules: RestrictionRule[] = [];
  roomRules: RestrictionRule[] = [];
  timeslotRules: RestrictionRule[] = [];

  year: Year[] = [
    Year.FIRST, Year.SECOND, Year.THIRD,
    Year.FOURTH, Year.FIFTH, Year.SIXTH
  ];
  lessonType: LessonType[] = [
    LessonType.COURSE, LessonType.LABORATORY,
    LessonType.PROJECT, LessonType.SEMINAR
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
    private ruleService: RestrictionRuleService,
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
      appliedRoomRuleIds: [[]],
      appliedTimeslotRuleIds: [[]],
      roomRuleCombination: RuleCombination.AND,
      timeslotRuleCombination: RuleCombination.AND,
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
        timeslot: this.data.timeslot?.id ?? this.data.timeslot ?? null,
        room: this.data.room?.id ?? this.data.room ?? null,
      });
    }

    // Load all data in parallel
    this.teacherService.getAllTeachers().subscribe((teachers) => {
      this.teachers = teachers;
      this.filteredTeachers = this.lessonForm.controls['teacher'].valueChanges.pipe(
        startWith(''),
        map((value) => this._filterTeachers(value || ''))
      );
    });

    this.studentGroupService.getAllStudentGroups().subscribe((groups) => {
      this.studentGroups = groups;
      this.filteredStudentGroups = this.lessonForm.controls['studentGroup'].valueChanges.pipe(
        startWith(''),
        map((value) => this._filterStudentGroups(value || ''))
      );
    });

    this.timeslotService.getAllTimeslots().subscribe((timeslots) => {
      this.timeslots = timeslots;
      this.groupTimeslotsByDay();
    });

    this.roomService.getAllRooms().subscribe((rooms) => {
      this.rooms = rooms;
    });

    // Load restriction rules
    this.ruleService.getAll().subscribe((rules) => {
      this.allRules = rules;
      this.roomRules = rules.filter(r => r.targetType === RuleTargetType.ROOM);
      this.timeslotRules = rules.filter(r => r.targetType === RuleTargetType.TIMESLOT);
    });

    // If editing, load existing lesson-rule associations
    if (this.data?.id) {
      this.ruleService.getLessonRules(this.data.id).subscribe({
        next: (response) => {
          const allIds: number[] = response.ruleIds || [];
          // Split IDs by rule type once allRules are loaded
          this.ruleService.getAll().subscribe((rules) => {
            const roomRuleIdSet = new Set(rules.filter(r => r.targetType === RuleTargetType.ROOM).map(r => r.id));
            const timeslotRuleIdSet = new Set(rules.filter(r => r.targetType === RuleTargetType.TIMESLOT).map(r => r.id));

            this.lessonForm.patchValue({
              appliedRoomRuleIds: allIds.filter(id => roomRuleIdSet.has(id)),
              appliedTimeslotRuleIds: allIds.filter(id => timeslotRuleIdSet.has(id)),
              roomRuleCombination: response.roomRuleCombination || RuleCombination.AND,
              timeslotRuleCombination: response.timeslotRuleCombination || RuleCombination.AND,
            });
          });
        },
        error: () => {
          // No restrictions configured yet, that's fine
        }
      });
    }
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
      'MONDAY': 'Monday', 'TUESDAY': 'Tuesday', 'WEDNESDAY': 'Wednesday',
      'THURSDAY': 'Thursday', 'FRIDAY': 'Friday',
    };
    return dayMap[day] || day;
  }

  getTimeslotsByDay(day: string): Timeslot[] {
    return this.groupedTimeslots.get(day) || [];
  }

  private _filterTeachers(value: string): Teacher[] {
    const filterValue = value.toLowerCase();
    return this.teachers.filter(
      (teacher) => teacher.name && teacher.name.toString().toLowerCase().includes(filterValue)
    );
  }

  private _filterStudentGroups(value: string): StudentGroup[] {
    const filterValue = value.toLowerCase();
    return this.studentGroups.filter(
      (group) => group.studentGroup && group.studentGroup.toString().toLowerCase().includes(filterValue)
    );
  }

  displayFnTeacher(teacher: Teacher): string {
    return teacher && teacher.name ? teacher.name : '';
  }

  displayFnStudentGroup(group: StudentGroup): string {
    return group && group.studentGroup ? group.studentGroup : '';
  }

  /** Check if the lesson has any active restrictions configured. */
  hasActiveRestrictions(): boolean {
    const roomIds = this.lessonForm.get('appliedRoomRuleIds')?.value || [];
    const timeslotIds = this.lessonForm.get('appliedTimeslotRuleIds')?.value || [];
    return roomIds.length > 0 || timeslotIds.length > 0;
  }

  /** Get a rule's display name by ID */
  getRuleName(ruleId: number): string {
    const rule = this.allRules.find(r => r.id === ruleId);
    return rule?.name || `Rule #${ruleId}`;
  }

  /** Get count of applied room rules */
  get appliedRoomRuleCount(): number {
    return (this.lessonForm.get('appliedRoomRuleIds')?.value || []).length;
  }

  /** Get count of applied timeslot rules */
  get appliedTimeslotRuleCount(): number {
    return (this.lessonForm.get('appliedTimeslotRuleIds')?.value || []).length;
  }

  /** Combine both arrays into one for the API */
  private getMergedRuleIds(): number[] {
    const roomIds: number[] = this.lessonForm.get('appliedRoomRuleIds')?.value || [];
    const timeslotIds: number[] = this.lessonForm.get('appliedTimeslotRuleIds')?.value || [];
    return [...roomIds, ...timeslotIds];
  }

  /** Clear all restrictions from the form. */
  clearRestrictions(): void {
    this.lessonForm.patchValue({
      appliedRoomRuleIds: [],
      appliedTimeslotRuleIds: [],
      roomRuleCombination: RuleCombination.AND,
      timeslotRuleCombination: RuleCombination.AND,
    });
  }

  onFormSubmit() {
    if (this.lessonForm.valid) {
      const formValue = this.lessonForm.value;

      const lessonData: any = {
        subject: formValue.subject,
        teacher: formValue.teacher,
        studentGroup: formValue.studentGroup,
        lessonType: formValue.lessonType,
        year: formValue.year,
        duration: formValue.duration,
        pinned: formValue.pinned || false,
      };

      if (formValue.pinned) {
        if (formValue.timeslot) {
          lessonData.timeslot = { id: formValue.timeslot };
        }
        if (formValue.room) {
          lessonData.room = { id: formValue.room };
        }
      }

      const mergedRuleIds = this.getMergedRuleIds();

      if (this.data) {
        // Update existing lesson, then apply rules
        this.lessonService
          .updateLesson(this.data.id, lessonData)
          .pipe(
            switchMap(() => {
              return this.ruleService.applyRulesToLesson(this.data.id, {
                ruleIds: mergedRuleIds,
                roomRuleCombination: formValue.roomRuleCombination || RuleCombination.AND,
                timeslotRuleCombination: formValue.timeslotRuleCombination || RuleCombination.AND,
              });
            }),
            catchError(err => {
              console.error('Error saving rules:', err);
              return of(null);
            })
          )
          .subscribe({
            next: () => {
              this.coreService.openSnackBar('Lesson detail updated!');
              this.dialogRef.close(true);
            },
            error: (err: any) => {
              console.error(err);
              this.coreService.openSnackBar('Error updating lesson');
            },
          });
      } else {
        // Create new lesson, then apply rules if any
        this.lessonService.createLesson(lessonData).pipe(
          switchMap((savedLesson: any) => {
            if (mergedRuleIds.length > 0) {
              return this.ruleService.applyRulesToLesson(savedLesson.id, {
                ruleIds: mergedRuleIds,
                roomRuleCombination: formValue.roomRuleCombination || RuleCombination.AND,
                timeslotRuleCombination: formValue.timeslotRuleCombination || RuleCombination.AND,
              });
            }
            return of(savedLesson);
          }),
          catchError(err => {
            console.error('Error saving rules:', err);
            return of(null);
          })
        ).subscribe({
          next: () => {
            this.coreService.openSnackBar('Lesson added successfully');
            this.dialogRef.close(true);
          },
          error: (err: any) => {
            console.error(err);
            this.coreService.openSnackBar('Error creating lesson');
          },
        });
      }
    }
  }
}
