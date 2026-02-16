import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { RestrictionRule, RuleTargetType } from '../model/timetableEntities';
import { RestrictionRuleService } from './restriction-rule.service';
import { RuleDialogComponent } from './rule-dialog/rule-dialog.component';
import { CoreService } from '../core/core.service';

@Component({
  selector: 'app-assignment-rules',
  templateUrl: './assignment-rules.component.html',
  styleUrls: ['./assignment-rules.component.css'],
})
export class AssignmentRulesComponent implements OnInit {
  dataSource = new MatTableDataSource<RestrictionRule>([]);
  displayedColumns: string[] = ['name', 'targetType', 'definition', 'action'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  filterValues: any = {
    name: '',
    targetType: '',
  };

  constructor(
    private ruleService: RestrictionRuleService,
    private dialog: MatDialog,
    private coreService: CoreService
  ) {}

  ngOnInit(): void {
    this.loadRules();
  }

  openAddRuleForm(): void {
    const dialogRef = this.dialog.open(RuleDialogComponent, {
      width: '650px',
      data: null,
    });
    dialogRef.afterClosed().subscribe({
      next: (val) => {
        if (val) {
          this.loadRules();
        }
      },
    });
  }

  openEditForm(rule: RestrictionRule): void {
    const dialogRef = this.dialog.open(RuleDialogComponent, {
      width: '650px',
      data: rule,
    });
    dialogRef.afterClosed().subscribe({
      next: (val) => {
        if (val) {
          this.loadRules();
        }
      },
    });
  }

  deleteRule(id: number): void {
    this.ruleService.deleteRule(id).subscribe({
      next: () => {
        this.coreService.openSnackBar('Rule deleted!', 'done');
        this.loadRules();
      },
      error: console.log,
    });
  }

  loadRules(): void {
    this.ruleService.getAllRules().subscribe((rules) => {
      this.dataSource.data = rules;
      this.dataSource.paginator = this.paginator;

      this.dataSource.filterPredicate = (data: RestrictionRule, filter: string) => {
        const searchTerms = JSON.parse(filter);
        const nameMatch = !searchTerms.name ||
          data.name?.toLowerCase().includes(searchTerms.name.toLowerCase());
        const typeMatch = !searchTerms.targetType ||
          data.targetType === searchTerms.targetType;
        return Boolean(nameMatch && typeMatch);
      };
    });
  }

  getRuleDefinition(rule: RestrictionRule): string {
    if (rule.criteriaField && rule.operator) { // removed criteriaValue check to allow dynamic display
      const operatorLabels: Record<string, string> = {
        EQUALS: '=',
        NOT_EQUALS: '≠',
        IN: '∈',
        NOT_IN: '∉',
        GREATER_THAN_OR_EQUAL: '≥',
        LESS_THAN: '<',
        CONTAINS: 'contains',
      };
      
      const op = operatorLabels[rule.operator.toString()] || rule.operator;
      const val = rule.criteriaValue || '';
      
      return `${rule.criteriaField} ${op} "${val}"`;
    }
    if (rule.specificRooms && rule.specificRooms.length > 0) {
      const count = rule.specificRooms.length;
      return `Specific List: ${count} room${count > 1 ? 's' : ''}`;
    }
    if (rule.specificTimeslots && rule.specificTimeslots.length > 0) {
      const count = rule.specificTimeslots.length;
      return `Specific List: ${count} timeslot${count > 1 ? 's' : ''}`;
    }
    return 'Not configured';
  }

  getIcon(rule: RestrictionRule): string {
    if (rule.criteriaField) {
        return 'tune'; // Sliders icon for criteria
    }
    return 'checklist'; // Checklist icon for specific items
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
}
