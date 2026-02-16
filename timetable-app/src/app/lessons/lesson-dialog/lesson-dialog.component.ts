import { Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { LessonService } from '../lesson.service';
import { CoreService } from 'src/app/core/core.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TeacherService } from 'src/app/teachers/teacher.service';
import { StudentGroupService } from 'src/app/student-group/student-group.service';
import { TimeslotService } from 'src/app/timeslots/timeslot.service';
import { RoomService } from 'src/app/rooms/room.service';
import { RestrictionRuleService } from 'src/app/assignment-rules/restriction-rule.service';
import { Observable, map, startWith } from 'rxjs';
import {
  LessonType, RestrictionRule, Room, RuleCombination, RuleOperator,
  RuleTargetType, StudentGroup, Teacher, Timeslot, Year
} from 'src/app/model/timetableEntities';

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
  allRules: RestrictionRule[] = [];
  roomRules: RestrictionRule[] = [];
  timeslotRules: RestrictionRule[] = [];
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
    private ruleService: RestrictionRuleService,
    private coreService: CoreService,
    private dialogRef: MatDialogRef<LessonDialogComponent>,
    private router: Router,
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
      selectedRoomRuleIds: [[]],
      selectedTimeslotRuleIds: [[]],
      roomRuleCombination: [RuleCombination.AND],
      timeslotRuleCombination: [RuleCombination.AND],
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

    // Load restriction rules
    this.ruleService.getAllRules().subscribe((rules) => {
      this.allRules = rules;
      this.roomRules = rules.filter(r => r.targetType === RuleTargetType.ROOM);
      this.timeslotRules = rules.filter(r => r.targetType === RuleTargetType.TIMESLOT);

      // If editing, populate rule selections from lesson data
      if (this.data?.appliedRuleIds) {
        const roomIds = this.data.appliedRuleIds.filter(
          (id: number) => this.roomRules.some(r => r.id === id)
        );
        const timeslotIds = this.data.appliedRuleIds.filter(
          (id: number) => this.timeslotRules.some(r => r.id === id)
        );
        this.lessonForm.patchValue({
          selectedRoomRuleIds: roomIds,
          selectedTimeslotRuleIds: timeslotIds,
          roomRuleCombination: this.data.roomRuleCombination || RuleCombination.AND,
          timeslotRuleCombination: this.data.timeslotRuleCombination || RuleCombination.AND,
        });
      }
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

  compareObjects(o1: any, o2: any): boolean {
    return o1 && o2 ? o1.id === o2.id : o1 === o2;
  }

  getRuleDescription(rule: RestrictionRule): string {
    if (rule.criteriaField && rule.operator) {
      let opSymbol = rule.operator.toString();
      switch (rule.operator) {
        case RuleOperator.EQUALS: opSymbol = '='; break;
        case RuleOperator.NOT_EQUALS: opSymbol = '≠'; break;
        case RuleOperator.GREATER_THAN_OR_EQUAL: opSymbol = '>='; break;
        case RuleOperator.LESS_THAN: opSymbol = '<'; break;
        case RuleOperator.CONTAINS: opSymbol = 'contains'; break;
        case RuleOperator.IN: opSymbol = 'in'; break;
        case RuleOperator.NOT_IN: opSymbol = 'not in'; break;
      }
      return `${rule.criteriaField} ${opSymbol} ${rule.criteriaValue}`;
    } else if (rule.specificRooms && rule.specificRooms.length > 0) {
      const count = rule.specificRooms.length;
      return `Specific List: ${count} room${count > 1 ? 's' : ''}`;
    } else if (rule.specificTimeslots && rule.specificTimeslots.length > 0) {
      const count = rule.specificTimeslots.length;
      return `Specific List: ${count} timeslot${count > 1 ? 's' : ''}`;
    }
    return 'Custom Rule';
  }

  saveAndNavigateToRules(): void {
    // We close the dialog first to ensure cleanup
    this.dialogRef.close();
    this.router.navigate(['/assignment-rules']);
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

      const saveLesson = (lessonId: number) => {
        // Combine room + timeslot rule IDs
        const allRuleIds: number[] = [
          ...(formValue.selectedRoomRuleIds || []),
          ...(formValue.selectedTimeslotRuleIds || []),
        ];

        if (allRuleIds.length > 0) {
          this.ruleService.applyRulesToLesson(lessonId, {
            ruleIds: allRuleIds,
            roomRuleCombination: formValue.roomRuleCombination || RuleCombination.AND,
            timeslotRuleCombination: formValue.timeslotRuleCombination || RuleCombination.AND,
          }).subscribe({
            next: () => this.dialogRef.close(true),
            error: (err: any) => console.error('Error applying rules:', err),
          });
        } else {
          // Clear rules if none selected
          if (this.data?.hasRestrictions) {
            this.ruleService.clearLessonRules(lessonId).subscribe({
              next: () => this.dialogRef.close(true),
              error: (err: any) => console.error('Error clearing rules:', err),
            });
          } else {
            this.dialogRef.close(true);
          }
        }
      };
      
      if (this.data) {
        this.lessonService
          .updateLesson(this.data.id, lessonData)
          .subscribe({
            next: () => {
              this.coreService.openSnackBar('Lesson detail updated!');
              saveLesson(this.data.id);
            },
            error: (err: any) => {
              console.error(err);
            },
          });
      } else {
        this.lessonService.createLesson(lessonData).subscribe({
          next: (created: any) => {
            this.coreService.openSnackBar('Lesson added successfully');
            saveLesson(created.id);
          },
          error: (err: any) => {
            console.error(err);
          },
        });
      }
    }
  }
}


