import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CoreService } from 'src/app/core/core.service';
import {
  RestrictionRule,
  RuleTargetType,
  RuleCriteriaField,
  RuleOperator,
  CRITERIA_FIELDS_BY_TARGET,
  OPERATORS_BY_FIELD,
  Room,
  Timeslot,
} from 'src/app/model/timetableEntities';
import { RestrictionRuleService } from '../restriction-rule.service';
import { RoomService } from 'src/app/rooms/room.service';
import { TimeslotService } from 'src/app/timeslots/timeslot.service';

interface MatchPreviewItem {
  label: string;
  detail: string;
  icon: string;
}

interface SelectOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-restriction-rule-dialog',
  templateUrl: './restriction-rule-dialog.component.html',
  styleUrls: ['./restriction-rule-dialog.component.css'],
})
export class RestrictionRuleDialogComponent implements OnInit {

  ruleForm: FormGroup;
  targetTypes = Object.values(RuleTargetType);
  availableFields: RuleCriteriaField[] = [];
  availableOperators: RuleOperator[] = [];
  hasAddedItem = false;

  rooms: Room[] = [];
  timeslots: Timeslot[] = [];
  distinctBuildings: string[] = [];

  // Cached template bindings — updated only on explicit change events
  cachedSelectOptions: SelectOption[] = [];
  matchingEntities: MatchPreviewItem[] = [];
  inputMode: 'select' | 'multiselect' | 'number' | 'time' | 'text' | 'hidden' = 'hidden';
  fieldDescription = '';
  helpText = '';
  exampleText = '';
  placeholderText = '';
  targetIcon = 'rule';

  readonly WEEKDAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

  constructor(
    private fb: FormBuilder,
    private ruleService: RestrictionRuleService,
    private roomService: RoomService,
    private timeslotService: TimeslotService,
    private coreService: CoreService,
    private dialogRef: MatDialogRef<RestrictionRuleDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: RestrictionRule | null
  ) {
    this.ruleForm = this.fb.group({
      name: ['', Validators.required],
      targetType: [null, Validators.required],
      criteriaField: [null, Validators.required],
      operator: [null, Validators.required],
      criteriaValue: ['', Validators.required],
      active: [true],
    });
  }

  ngOnInit(): void {
    this.roomService.getAllRooms().subscribe(rooms => {
      this.rooms = rooms;
      this.distinctBuildings = [...new Set(rooms
        .map(r => r.building)
        .filter((b): b is string => !!b)
      )].sort();
      this.rebuildCachedState();
    });

    this.timeslotService.getAllTimeslots().subscribe(timeslots => {
      this.timeslots = timeslots;
      this.rebuildCachedState();
    });

    if (this.data) {
      this.ruleForm.patchValue(this.data);
      this.onTargetTypeChange(this.data.targetType);
      this.onCriteriaFieldChange(this.data.criteriaField);
    }
  }

  // ── Change Handlers ─────────────────────────────────────────────

  onTargetTypeChange(targetType: RuleTargetType): void {
    this.availableFields = CRITERIA_FIELDS_BY_TARGET[targetType] || [];
    this.availableOperators = [];
    if (!this.data || this.ruleForm.get('targetType')?.dirty) {
      this.ruleForm.patchValue({ criteriaField: null, operator: null, criteriaValue: '' });
    }
    this.targetIcon = targetType === RuleTargetType.ROOM ? 'meeting_room' : 'schedule';
    this.rebuildCachedState();
  }

  onCriteriaFieldChange(field: RuleCriteriaField): void {
    this.availableOperators = OPERATORS_BY_FIELD[field] || [];
    if (!this.data || this.ruleForm.get('criteriaField')?.dirty) {
      this.ruleForm.patchValue({ operator: null, criteriaValue: '' });
    }
    this.rebuildCachedState();
  }

  onOperatorChange(): void {
    if (this.ruleForm.get('operator')?.dirty) {
      this.ruleForm.patchValue({ criteriaValue: '' });
    }
    this.rebuildCachedState();
  }

  onValueChange(): void {
    this.rebuildPreview();
    this.rebuildHelpText();
  }

  // ── Core Rebuild (only called from change handlers) ─────────────

  private rebuildCachedState(): void {
    this.rebuildInputMode();
    this.rebuildSelectOptions();
    this.rebuildFieldDescription();
    this.rebuildPlaceholder();
    this.rebuildExampleText();
    this.rebuildHelpText();
    this.rebuildPreview();
  }

  private rebuildInputMode(): void {
    const field = this.getField();
    const operator = this.getOperator();

    if (!operator) {
      this.inputMode = 'hidden';
      return;
    }

    const isSelectableField = field === RuleCriteriaField.NAME
      || field === RuleCriteriaField.BUILDING
      || field === RuleCriteriaField.DAY_OF_WEEK;

    // For text-matching operators, always show free text even for select-capable fields
    const isTextOperator = operator === RuleOperator.CONTAINS || operator === RuleOperator.STARTS_WITH;

    if (isSelectableField && !isTextOperator) {
      this.inputMode = operator === RuleOperator.IN ? 'multiselect' : 'select';
    } else if (field === RuleCriteriaField.CAPACITY) {
      this.inputMode = 'number';
    } else if (field === RuleCriteriaField.START_TIME || field === RuleCriteriaField.END_TIME) {
      this.inputMode = 'time';
    } else {
      this.inputMode = 'text';
    }
  }

  private rebuildSelectOptions(): void {
    const field = this.getField();

    if (field === RuleCriteriaField.NAME) {
      this.cachedSelectOptions = this.rooms.map(r => ({
        value: r.name || '',
        label: `${r.name}${r.building ? ' – ' + r.building : ''} (cap. ${r.capacity})`,
      }));
    } else if (field === RuleCriteriaField.BUILDING) {
      this.cachedSelectOptions = this.distinctBuildings.map(b => ({ value: b, label: b }));
    } else if (field === RuleCriteriaField.DAY_OF_WEEK) {
      this.cachedSelectOptions = this.WEEKDAYS.map(d => ({
        value: d,
        label: d.charAt(0) + d.slice(1).toLowerCase(),
      }));
    } else {
      this.cachedSelectOptions = [];
    }
  }

  private rebuildFieldDescription(): void {
    const field = this.getField();
    const target = this.ruleForm.get('targetType')?.value;
    if (!field) { this.fieldDescription = ''; return; }

    const descriptions: Record<string, string> = {
      NAME: target === RuleTargetType.ROOM
        ? 'Filter by room name — select specific rooms for this rule'
        : 'Filter by name',
      BUILDING: 'Filter by building — restrict lessons to rooms in a specific building',
      CAPACITY: 'Filter by room capacity — e.g. only rooms that seat at least 50 students',
      DAY_OF_WEEK: 'Filter by day — restrict lessons to specific days of the week',
      START_TIME: 'Filter by start time — e.g. only timeslots starting after 10:00',
      END_TIME: 'Filter by end time — e.g. only timeslots ending before 16:00',
    };
    this.fieldDescription = descriptions[field] || '';
  }

  private rebuildPlaceholder(): void {
    const field = this.getField();
    if (!field) { this.placeholderText = ''; return; }

    if (this.inputMode === 'select') this.placeholderText = 'Select…';
    else if (this.inputMode === 'multiselect') this.placeholderText = 'Select one or more…';
    else if (this.inputMode === 'number') this.placeholderText = 'e.g. 50';
    else if (this.inputMode === 'time') this.placeholderText = 'e.g. 08:00';
    else this.placeholderText = 'Type a value…';
  }

  private rebuildExampleText(): void {
    const field = this.getField();
    const operator = this.getOperator();
    if (!field || !operator) { this.exampleText = ''; return; }

    const examples: Record<string, Record<string, string>> = {
      NAME: {
        EQUALS: 'Example: Select "Lab A1" → only Lab A1 is allowed',
        NOT_EQUALS: 'Example: Select "Lab A1" → all rooms except Lab A1',
        CONTAINS: 'Example: Type "Lab" → matches Lab A1, Lab B2, Physics Lab…',
        STARTS_WITH: 'Example: Type "Amf" → matches Amfiteatru 1, Amfiteatru 2…',
        IN: 'Example: Select multiple rooms → any of them is allowed',
      },
      BUILDING: {
        EQUALS: 'Example: Select "Building A" → only rooms in Building A',
        NOT_EQUALS: 'Example: Select "Building B" → rooms in all buildings except B',
        CONTAINS: 'Example: Type "Corp" → matches Corp A, Corp B…',
        STARTS_WITH: 'Example: Type "P" → matches P1, P2, P3…',
        IN: 'Example: Select multiple buildings → rooms in any of them',
      },
      CAPACITY: {
        EQUALS: 'Example: 30 → only rooms with exactly 30 seats',
        GREATER_THAN: 'Example: 50 → rooms with more than 50 seats',
        GREATER_THAN_OR_EQUAL: 'Example: 100 → rooms with 100 or more seats',
        LESS_THAN: 'Example: 40 → only small rooms under 40 seats',
        LESS_THAN_OR_EQUAL: 'Example: 60 → rooms with 60 or fewer seats',
        NOT_EQUALS: 'Example: 25 → any room except those with exactly 25 seats',
      },
      DAY_OF_WEEK: {
        EQUALS: 'Example: Select "Monday" → only Monday timeslots',
        NOT_EQUALS: 'Example: Select "Friday" → any day except Friday',
        IN: 'Example: Select Mon, Wed, Fri → any of those days',
      },
      START_TIME: {
        EQUALS: 'Example: 08:00 → only timeslots starting at 8 AM',
        GREATER_THAN: 'Example: 10:00 → timeslots starting after 10 AM',
        GREATER_THAN_OR_EQUAL: 'Example: 08:00 → timeslots starting at 8 AM or later',
        LESS_THAN: 'Example: 14:00 → morning timeslots (before 2 PM)',
        LESS_THAN_OR_EQUAL: 'Example: 12:00 → timeslots starting by noon',
        NOT_EQUALS: 'Example: 08:00 → any start time except 8 AM',
      },
      END_TIME: {
        EQUALS: 'Example: 12:00 → only timeslots ending at noon',
        GREATER_THAN: 'Example: 14:00 → timeslots ending after 2 PM',
        GREATER_THAN_OR_EQUAL: 'Example: 16:00 → timeslots ending at 4 PM or later',
        LESS_THAN: 'Example: 18:00 → timeslots ending before 6 PM',
        LESS_THAN_OR_EQUAL: 'Example: 20:00 → timeslots ending by 8 PM',
        NOT_EQUALS: 'Example: 10:00 → any end time except 10 AM',
      },
    };
    this.exampleText = examples[field]?.[operator] || '';
  }

  private rebuildHelpText(): void {
    const target = this.ruleForm.get('targetType')?.value;
    const field = this.getField();
    const operator = this.getOperator();
    const value = this.ruleForm.get('criteriaValue')?.value;

    if (!target || !field || !operator) { this.helpText = ''; return; }

    const targetName = target === RuleTargetType.ROOM ? 'rooms' : 'timeslots';
    const fieldLabel = this.formatLabel(field).toLowerCase();
    const opLabel = this.getOperatorSymbol(operator);

    if (!value || (Array.isArray(value) && value.length === 0)) {
      this.helpText = `Will match ${targetName} where ${fieldLabel} ${opLabel} the selected value`;
    } else {
      const displayValue = Array.isArray(value) ? value.join(', ') : value;
      this.helpText = `Matches ${targetName} where ${fieldLabel} ${opLabel} "${displayValue}"`;
    }
  }

  private rebuildPreview(): void {
    const target = this.ruleForm.get('targetType')?.value;
    const field = this.getField();
    const operator = this.getOperator();
    const rawValue = this.ruleForm.get('criteriaValue')?.value;

    if (!target || !field || !operator || !rawValue || (Array.isArray(rawValue) && rawValue.length === 0)) {
      this.matchingEntities = [];
      return;
    }

    if (target === RuleTargetType.ROOM) {
      this.matchingEntities = this.rooms
        .filter(room => this.evaluateRoom(room, field, operator, rawValue))
        .map(room => ({
          label: room.name || '—',
          detail: `${room.building || 'No building'} · ${room.capacity} seats`,
          icon: 'meeting_room',
        }));
    } else {
      this.matchingEntities = this.timeslots
        .filter(ts => this.evaluateTimeslot(ts, field, operator, rawValue))
        .map(ts => ({
          label: this.formatDay(ts.dayOfWeek),
          detail: `${ts.startTime?.substring(0, 5)} – ${ts.endTime?.substring(0, 5)}`,
          icon: 'schedule',
        }));
    }
  }

  // ── Form Submission ─────────────────────────────────────────────

  onFormSubmit(keepOpen: boolean = false): void {
    if (this.ruleForm.valid) {
      const formValue = this.ruleForm.value;

      // Normalize multi-select array values to comma-joined string for backend
      const criteriaValue = Array.isArray(formValue.criteriaValue)
        ? formValue.criteriaValue.join(',')
        : String(formValue.criteriaValue);

      const ruleData: RestrictionRule = { ...formValue, criteriaValue };

      if (this.data) {
        this.ruleService.updateRule(this.data.id!, ruleData).subscribe({
          next: () => {
            this.coreService.openSnackBar('Rule updated successfully');
            this.dialogRef.close(true);
          },
          error: (err: any) => console.error(err),
        });
      } else {
        this.ruleService.createRule(ruleData).subscribe({
          next: () => {
            this.coreService.openSnackBar('Rule created successfully');
            if (keepOpen) {
              this.hasAddedItem = true;
              this.dialogRef.disableClose = true;
            } else {
              this.dialogRef.close(true);
            }
          },
          error: (err: any) => console.error(err),
        });
      }
    }
  }

  closeDialog() {
    this.dialogRef.close(this.hasAddedItem);
  }

  // ── Helpers ─────────────────────────────────────────────────────

  formatLabel(value: string): string {
    return value.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }

  private getField(): RuleCriteriaField | null {
    return this.ruleForm.get('criteriaField')?.value || null;
  }

  private getOperator(): RuleOperator | null {
    return this.ruleForm.get('operator')?.value || null;
  }

  private getOperatorSymbol(op: RuleOperator): string {
    const symbols: Record<string, string> = {
      EQUALS: 'equals',
      NOT_EQUALS: 'does not equal',
      STARTS_WITH: 'starts with',
      CONTAINS: 'contains',
      LESS_THAN: 'is less than',
      GREATER_THAN: 'is greater than',
      LESS_THAN_OR_EQUAL: 'is at most',
      GREATER_THAN_OR_EQUAL: 'is at least',
      IN: 'is one of',
    };
    return symbols[op] || op;
  }

  // ── Entity Evaluation ───────────────────────────────────────────

  private evaluateRoom(room: Room, field: RuleCriteriaField, operator: RuleOperator, rawValue: any): boolean {
    let entityValue: string;
    switch (field) {
      case RuleCriteriaField.NAME: entityValue = room.name || ''; break;
      case RuleCriteriaField.BUILDING: entityValue = room.building || ''; break;
      case RuleCriteriaField.CAPACITY: entityValue = String(room.capacity || 0); break;
      default: return false;
    }
    return this.evaluate(entityValue, operator, rawValue, field === RuleCriteriaField.CAPACITY);
  }

  private evaluateTimeslot(ts: Timeslot, field: RuleCriteriaField, operator: RuleOperator, rawValue: any): boolean {
    let entityValue: string;
    switch (field) {
      case RuleCriteriaField.DAY_OF_WEEK: entityValue = ts.dayOfWeek || ''; break;
      case RuleCriteriaField.START_TIME: entityValue = ts.startTime || ''; break;
      case RuleCriteriaField.END_TIME: entityValue = ts.endTime || ''; break;
      default: return false;
    }
    return this.evaluate(entityValue, operator, rawValue, false);
  }

  private evaluate(entityValue: string, operator: RuleOperator, rawValue: any, numeric: boolean): boolean {
    const values: string[] = Array.isArray(rawValue) ? rawValue : [String(rawValue)];
    const ev = entityValue.toLowerCase();

    switch (operator) {
      case RuleOperator.EQUALS:
        return numeric
          ? Number(entityValue) === Number(values[0])
          : ev === String(values[0]).toLowerCase();
      case RuleOperator.NOT_EQUALS:
        return numeric
          ? Number(entityValue) !== Number(values[0])
          : ev !== String(values[0]).toLowerCase();
      case RuleOperator.CONTAINS:
        return ev.includes(String(values[0]).toLowerCase());
      case RuleOperator.STARTS_WITH:
        return ev.startsWith(String(values[0]).toLowerCase());
      case RuleOperator.LESS_THAN:
        return numeric ? Number(entityValue) < Number(values[0]) : entityValue < String(values[0]);
      case RuleOperator.GREATER_THAN:
        return numeric ? Number(entityValue) > Number(values[0]) : entityValue > String(values[0]);
      case RuleOperator.LESS_THAN_OR_EQUAL:
        return numeric ? Number(entityValue) <= Number(values[0]) : entityValue <= String(values[0]);
      case RuleOperator.GREATER_THAN_OR_EQUAL:
        return numeric ? Number(entityValue) >= Number(values[0]) : entityValue >= String(values[0]);
      case RuleOperator.IN:
        return values.some(v => ev === v.toLowerCase());
      default:
        return false;
    }
  }

  private formatDay(day?: string): string {
    if (!day) return '—';
    return day.charAt(0) + day.slice(1).toLowerCase();
  }
}
