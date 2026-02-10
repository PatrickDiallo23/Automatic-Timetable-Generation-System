import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CoreService } from 'src/app/core/core.service';
import { RoomService } from 'src/app/rooms/room.service';
import { TimeslotService } from 'src/app/timeslots/timeslot.service';
import {
  RestrictionRule, Room, RuleOperator, RuleTargetType, Timeslot
} from 'src/app/model/timetableEntities';
import { RestrictionRuleService } from '../restriction-rule.service';

@Component({
  selector: 'app-rule-dialog',
  templateUrl: './rule-dialog.component.html',
  styleUrls: ['./rule-dialog.component.css'],
})
export class RuleDialogComponent implements OnInit {

  ruleForm: FormGroup;
  rooms: Room[] = [];
  timeslots: Timeslot[] = [];
  groupedTimeslots: Map<string, Timeslot[]> = new Map();
  dayOrder = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];

  targetTypes = [RuleTargetType.ROOM, RuleTargetType.TIMESLOT];
  operators = Object.values(RuleOperator);

  /** Criteria fields available per target type */
  roomFields = ['building', 'capacity', 'name'];
  timeslotFields = ['dayOfWeek', 'startTime', 'endTime'];

  /** Track whether we're in criteria or specific-items mode */
  mode: 'criteria' | 'specific' = 'criteria';

  constructor(
    private fb: FormBuilder,
    private ruleService: RestrictionRuleService,
    private roomService: RoomService,
    private timeslotService: TimeslotService,
    private coreService: CoreService,
    private dialogRef: MatDialogRef<RuleDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: RestrictionRule | null
  ) {
    this.ruleForm = this.fb.group({
      name: ['', Validators.required],
      targetType: [RuleTargetType.ROOM, Validators.required],
      criteriaField: [null],
      operator: [null],
      criteriaValue: [''],
      specificRoomIds: [[]],
      specificTimeslotIds: [[]],
    });
  }

  ngOnInit(): void {
    // Load reference data
    this.roomService.getAllRooms().subscribe((rooms) => this.rooms = rooms);
    this.timeslotService.getAllTimeslots().subscribe((timeslots) => {
      this.timeslots = timeslots;
      this.groupTimeslotsByDay();
    });

    // If editing, populate form
    if (this.data) {
      this.ruleForm.patchValue({
        name: this.data.name,
        targetType: this.data.targetType,
        criteriaField: this.data.criteriaField || null,
        operator: this.data.operator || null,
        criteriaValue: this.data.criteriaValue || '',
        specificRoomIds: this.data.specificRoomIds || [],
        specificTimeslotIds: this.data.specificTimeslotIds || [],
      });

      // Determine mode
      if ((this.data.specificRoomIds?.length ?? 0) > 0
        || (this.data.specificTimeslotIds?.length ?? 0) > 0) {
        this.mode = 'specific';
      } else {
        this.mode = 'criteria';
      }
    }
  }

  get currentTargetType(): RuleTargetType {
    return this.ruleForm.get('targetType')?.value;
  }

  get availableFields(): string[] {
    return this.currentTargetType === RuleTargetType.ROOM
      ? this.roomFields
      : this.timeslotFields;
  }

  onTargetTypeChange(): void {
    // Clear both specific lists when changing target type
    this.ruleForm.patchValue({
      criteriaField: null,
      operator: null,
      criteriaValue: '',
      specificRoomIds: [],
      specificTimeslotIds: [],
    });
  }

  onModeChange(): void {
    if (this.mode === 'criteria') {
      this.ruleForm.patchValue({
        specificRoomIds: [],
        specificTimeslotIds: [],
      });
    } else {
      this.ruleForm.patchValue({
        criteriaField: null,
        operator: null,
        criteriaValue: '',
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

  formatDay(day: string): string {
    const dayMap: { [key: string]: string } = {
      'MONDAY': 'Monday', 'TUESDAY': 'Tuesday', 'WEDNESDAY': 'Wednesday',
      'THURSDAY': 'Thursday', 'FRIDAY': 'Friday',
    };
    return dayMap[day] || day;
  }

  getTimeslotsByDay(day: string): Timeslot[] {
    return this.groupedTimeslots.get(day) || [];
  }

  onSubmit(): void {
    if (this.ruleForm.valid) {
      const formValue = this.ruleForm.value;

      const rule: RestrictionRule = {
        name: formValue.name,
        targetType: formValue.targetType,
      };

      if (this.mode === 'criteria') {
        rule.criteriaField = formValue.criteriaField;
        rule.operator = formValue.operator;
        rule.criteriaValue = formValue.criteriaValue;
      } else {
        if (formValue.targetType === RuleTargetType.ROOM) {
          rule.specificRoomIds = formValue.specificRoomIds;
        } else {
          rule.specificTimeslotIds = formValue.specificTimeslotIds;
        }
      }

      const request$ = this.data?.id
        ? this.ruleService.update(this.data.id, rule)
        : this.ruleService.create(rule);

      request$.subscribe({
        next: () => {
          this.coreService.openSnackBar(
            this.data ? 'Rule updated!' : 'Rule created!'
          );
          this.dialogRef.close(true);
        },
        error: (err) => {
          console.error(err);
          this.coreService.openSnackBar('Error saving rule');
        },
      });
    }
  }
}
