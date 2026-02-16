import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RestrictionRule, Room, RuleOperator, RuleTargetType, Timeslot } from '../../model/timetableEntities';
import { RoomService } from '../../rooms/room.service';
import { TimeslotService } from '../../timeslots/timeslot.service';
import { RestrictionRuleService } from '../restriction-rule.service';
import { CoreService } from '../../core/core.service';

@Component({
  selector: 'app-rule-dialog',
  templateUrl: './rule-dialog.component.html',
  styleUrls: ['./rule-dialog.component.css'],
})
export class RuleDialogComponent implements OnInit {
  ruleForm: FormGroup;
  rooms: Room[] = [];
  timeslots: Timeslot[] = [];
  previewCount: number | null = null;
  previewTotal: number | null = null;

  targetTypes = Object.values(RuleTargetType);
  operators = Object.values(RuleOperator);

  roomCriteriaFields = [
    { value: 'name', label: 'Room Name' },
    { value: 'building', label: 'Building' },
    { value: 'capacity', label: 'Capacity' },
  ];

  timeslotCriteriaFields = [
    { value: 'dayOfWeek', label: 'Day of Week' },
    { value: 'startTime', label: 'Start Time' },
    { value: 'endTime', label: 'End Time' },
  ];

  operatorLabels: Record<string, string> = {
    EQUALS: 'equals',
    NOT_EQUALS: 'does not equal',
    IN: 'is one of (comma-separated)',
    NOT_IN: 'is not one of (comma-separated)',
    GREATER_THAN_OR_EQUAL: '≥ (greater or equal)',
    LESS_THAN: '< (less than)',
    CONTAINS: 'contains',
  };

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<RuleDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: RestrictionRule | null,
    private roomService: RoomService,
    private timeslotService: TimeslotService,
    private ruleService: RestrictionRuleService,
    private coreService: CoreService
  ) {
    this.ruleForm = this.fb.group({
      name: ['', Validators.required],
      targetType: [RuleTargetType.ROOM, Validators.required],
      mode: ['criteria'],
      criteriaField: [''],
      operator: [''],
      criteriaValue: [''],
      specificRoomIds: [[]],
      specificTimeslotIds: [[]],
    });
  }

  ngOnInit(): void {
    this.loadData();
    if (this.data) {
      this.populateForm(this.data);
    }

    this.ruleForm.get('targetType')?.valueChanges.subscribe(() => {
      this.ruleForm.patchValue({
        criteriaField: '',
        operator: '',
        criteriaValue: '',
        specificRoomIds: [],
        specificTimeslotIds: [],
      });
      this.previewCount = null;
    });
  }

  private loadData(): void {
    this.roomService.getAllRooms().subscribe(rooms => this.rooms = rooms);
    this.timeslotService.getAllTimeslots().subscribe(timeslots => this.timeslots = timeslots);
  }

  private populateForm(rule: RestrictionRule): void {
    const isCriteria = !!(rule.criteriaField && rule.operator && rule.criteriaValue);
    this.ruleForm.patchValue({
      name: rule.name,
      targetType: rule.targetType,
      mode: isCriteria ? 'criteria' : 'specific',
      criteriaField: rule.criteriaField || '',
      operator: rule.operator || '',
      criteriaValue: rule.criteriaValue || '',
      specificRoomIds: rule.specificRooms?.map(r => r.id) || [],
      specificTimeslotIds: rule.specificTimeslots?.map(ts => ts.id) || [],
    });
  }

  get isRoomTarget(): boolean {
    return this.ruleForm.get('targetType')?.value === RuleTargetType.ROOM;
  }

  get isTimeslotTarget(): boolean {
    return this.ruleForm.get('targetType')?.value === RuleTargetType.TIMESLOT;
  }

  get isCriteriaMode(): boolean {
    return this.ruleForm.get('mode')?.value === 'criteria';
  }

  get currentCriteriaFields(): { value: string; label: string }[] {
    return this.isRoomTarget ? this.roomCriteriaFields : this.timeslotCriteriaFields;
  }

  getCriteriaHint(): string {
    const field = this.ruleForm.get('criteriaField')?.value;
    const operator = this.ruleForm.get('operator')?.value;

    if (field === 'dayOfWeek') {
      if (operator === 'IN' || operator === 'NOT_IN') {
        return 'e.g. MONDAY,WEDNESDAY,FRIDAY';
      }
      return 'e.g. MONDAY';
    }
    if (field === 'startTime' || field === 'endTime') {
      return 'e.g. 08:00, 12:00, 14:00';
    }
    if (field === 'capacity') {
      return 'e.g. 30, 50, 100';
    }
    if (operator === 'IN' || operator === 'NOT_IN') {
      return 'Comma-separated values';
    }
    return '';
  }

  formatTimeslot(ts: Timeslot): string {
    const day = ts.dayOfWeek ? ts.dayOfWeek.charAt(0) + ts.dayOfWeek.slice(1).toLowerCase() : '';
    const start = ts.startTime?.substring(0, 5) || '';
    const end = ts.endTime?.substring(0, 5) || '';
    return `${day} | ${start} - ${end}`;
  }

  onSubmit(): void {
    if (this.ruleForm.invalid) return;

    const formValue = this.ruleForm.value;
    const rule: RestrictionRule = {
      name: formValue.name,
      targetType: formValue.targetType,
    };

    if (formValue.mode === 'criteria') {
      rule.criteriaField = formValue.criteriaField;
      rule.operator = formValue.operator;
      rule.criteriaValue = formValue.criteriaValue;
    } else {
      if (formValue.targetType === RuleTargetType.ROOM) {
        rule.specificRooms = formValue.specificRoomIds.map((id: number) => ({ id }));
      } else {
        rule.specificTimeslots = formValue.specificTimeslotIds.map((id: number) => ({ id }));
      }
    }

    const operation = this.data?.id
      ? this.ruleService.updateRule(this.data.id, rule)
      : this.ruleService.createRule(rule);

    operation.subscribe({
      next: () => {
        this.coreService.openSnackBar(this.data?.id ? 'Rule updated!' : 'Rule created!');
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.coreService.openSnackBar('Error saving rule');
        console.error(err);
      },
    });
  }
}
