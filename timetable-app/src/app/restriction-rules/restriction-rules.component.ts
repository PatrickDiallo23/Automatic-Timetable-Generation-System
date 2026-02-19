import { MatTableDataSource } from '@angular/material/table';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CoreService } from '../core/core.service';
import { MatPaginator } from '@angular/material/paginator';
import { RestrictionRule, RuleTargetType } from '../model/timetableEntities';
import { RestrictionRuleService } from './restriction-rule.service';
import { RestrictionRuleDialogComponent } from './restriction-rule-dialog/restriction-rule-dialog.component';

@Component({
  selector: 'app-restriction-rules',
  templateUrl: './restriction-rules.component.html',
  styleUrls: ['./restriction-rules.component.css'],
})
export class RestrictionRulesComponent implements OnInit {

  dataSource = new MatTableDataSource<RestrictionRule>([]);
  displayedColumns: string[] = ['name', 'targetType', 'criteriaField', 'operator', 'criteriaValue', 'active', 'action'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  filterValues: any = {
    name: '',
    targetType: null,
  };

  constructor(
    private ruleService: RestrictionRuleService,
    private dialog: MatDialog,
    private coreService: CoreService
  ) {}

  ngOnInit(): void {
    this.loadRules();
  }

  openAddRuleForm() {
    const dialogRef = this.dialog.open(RestrictionRuleDialogComponent, {
      width: '520px',
    });
    dialogRef.afterClosed().subscribe({
      next: (val) => {
        if (val) {
          this.loadRules();
        }
      },
    });
  }

  openEditForm(data: RestrictionRule) {
    const dialogRef = this.dialog.open(RestrictionRuleDialogComponent, {
      data,
      width: '520px',
    });
    dialogRef.afterClosed().subscribe({
      next: (val) => {
        if (val) {
          this.loadRules();
        }
      },
    });
  }

  deleteRule(id: number) {
    this.ruleService.deleteRule(id).subscribe({
      next: () => {
        this.coreService.openSnackBar('Rule deleted!', 'done');
        this.loadRules();
      },
      error: console.log,
    });
  }

  toggleActive(rule: RestrictionRule) {
    const updated = { ...rule, active: !rule.active };
    this.ruleService.updateRule(rule.id!, updated).subscribe({
      next: () => {
        this.coreService.openSnackBar(
          updated.active ? 'Rule activated' : 'Rule deactivated',
          'done'
        );
        this.loadRules();
      },
      error: console.log,
    });
  }

  loadRules() {
    this.ruleService.getAllRules().subscribe((rules) => {
      this.dataSource.data = rules;
      this.dataSource.paginator = this.paginator;

      this.dataSource.filterPredicate = (data: RestrictionRule, filter: string) => {
        const searchTerms = JSON.parse(filter);
        const nameMatch = !searchTerms.name || data.name.toLowerCase().includes(searchTerms.name.toLowerCase());
        const targetMatch = !searchTerms.targetType || data.targetType === searchTerms.targetType;
        return Boolean(nameMatch && targetMatch);
      };
    });
  }

  applyFilter(field: string, value: any) {
    this.filterValues[field] = value || null;
    this.dataSource.filter = JSON.stringify(this.filterValues);
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  resetFilters() {
    this.filterValues = { name: '', targetType: null };
    this.dataSource.filter = JSON.stringify(this.filterValues);
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  formatFieldLabel(value: string): string {
    return value.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }

  getTargetTypes(): string[] {
    return Object.values(RuleTargetType);
  }
}
