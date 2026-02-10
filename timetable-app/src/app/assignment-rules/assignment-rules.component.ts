import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { CoreService } from '../core/core.service';
import { RestrictionRule, RuleTargetType } from '../model/timetableEntities';
import { RestrictionRuleService } from './restriction-rule.service';
import { RuleDialogComponent } from './rule-dialog/rule-dialog.component';

@Component({
  selector: 'app-assignment-rules',
  templateUrl: './assignment-rules.component.html',
  styleUrls: ['./assignment-rules.component.css'],
})
export class AssignmentRulesComponent implements OnInit {

  dataSource = new MatTableDataSource<RestrictionRule>([]);
  displayedColumns: string[] = ['name', 'targetType', 'mode', 'details', 'action'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  filterValues: any = {
    name: '',
    targetType: ''
  };

  constructor(
    private ruleService: RestrictionRuleService,
    private dialog: MatDialog,
    private coreService: CoreService
  ) {}

  ngOnInit(): void {
    this.loadRules();
  }

  openAddForm(): void {
    const dialogRef = this.dialog.open(RuleDialogComponent, {
      width: '600px',
    });
    dialogRef.afterClosed().subscribe((val) => {
      if (val) {
        this.loadRules();
      }
    });
  }

  openEditForm(data: RestrictionRule): void {
    const dialogRef = this.dialog.open(RuleDialogComponent, {
      width: '600px',
      data,
    });
    dialogRef.afterClosed().subscribe((val) => {
      if (val) {
        this.loadRules();
      }
    });
  }

  deleteRule(id: number): void {
    this.ruleService.delete(id).subscribe({
      next: () => {
        this.coreService.openSnackBar('Rule deleted!', 'done');
        this.loadRules();
      },
      error: (err) => {
        console.error(err);
        this.coreService.openSnackBar('Error deleting rule');
      },
    });
  }

  loadRules(): void {
    this.ruleService.getAll().subscribe((rules) => {
      this.dataSource.data = rules;
      this.dataSource.paginator = this.paginator;

      this.dataSource.filterPredicate = (data: RestrictionRule, filter: string) => {
        const searchTerms = JSON.parse(filter);
        const nameMatch = !searchTerms.name ||
          data.name.toLowerCase().includes(searchTerms.name.toLowerCase());
        const typeMatch = !searchTerms.targetType ||
          data.targetType === searchTerms.targetType;
        return Boolean(nameMatch && typeMatch);
      };
    });
  }

  applyFilter(field: string, value: any): void {
    this.filterValues[field] = value;
    this.dataSource.filter = JSON.stringify(this.filterValues);
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  resetFilters(): void {
    this.filterValues = { name: '', targetType: '' };
    this.dataSource.filter = JSON.stringify(this.filterValues);
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  /** Get a human-readable description of what the rule does */
  getRuleMode(rule: RestrictionRule): string {
    if (rule.specificRoomIds?.length || rule.specificTimeslotIds?.length) {
      return 'Specific Items';
    }
    if (rule.criteriaField) {
      return 'Criteria';
    }
    return '—';
  }

  /** Get details summary */
  getRuleDetails(rule: RestrictionRule): string {
    if (rule.criteriaField) {
      return `${rule.criteriaField} ${this.formatOperator(rule.operator)} ${rule.criteriaValue}`;
    }
    if (rule.specificRoomIds?.length) {
      return `${rule.specificRoomIds.length} room(s) selected`;
    }
    if (rule.specificTimeslotIds?.length) {
      return `${rule.specificTimeslotIds.length} timeslot(s) selected`;
    }
    return '—';
  }

  private formatOperator(op?: string): string {
    const map: { [key: string]: string } = {
      'EQUALS': '=',
      'NOT_EQUALS': '≠',
      'IN': 'in',
      'NOT_IN': 'not in',
      'GREATER_THAN_OR_EQUAL': '≥',
      'LESS_THAN': '<',
      'CONTAINS': 'contains',
    };
    return op ? (map[op] || op) : '';
  }
}
