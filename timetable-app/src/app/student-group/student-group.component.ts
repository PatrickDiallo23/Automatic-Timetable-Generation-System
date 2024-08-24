import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { StudentGroupService } from './student-group.service';
import { MatDialog } from '@angular/material/dialog';
import { CoreService } from '../core/core.service';
import { MatPaginator } from '@angular/material/paginator';
import { StudentGroupDialogComponent } from './student-group-dialog/student-group-dialog.component';
import { StudentGroup } from '../model/timetableEntities';

@Component({
  selector: 'app-student-group',
  templateUrl: './student-group.component.html',
  styleUrls: ['./student-group.component.css'],
})
export class StudentGroupComponent implements OnInit {

  newStudentGroup: StudentGroup = {};
  dataSource = new MatTableDataSource<StudentGroup>([]);
  displayedColumns: string[] = [
    'year',
    'name',
    'group',
    'semiGroup',
    'No. of Students',
    'action',
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  // @ViewChild(MatTable) table!: MatTable<Student>;

  constructor(
    private studentGroupService: StudentGroupService,
    private dialog: MatDialog,
    private coreService: CoreService
  ) {}

  ngOnInit(): void {
    this.loadStudentGroups();
  }

  openAddEditStudentGroupForm() {
    const dialogRef = this.dialog.open(StudentGroupDialogComponent);
    dialogRef.afterClosed().subscribe({
      next: (val) => {
        if (val) {
          console.log(val);
          this.loadStudentGroups();
        }
      },
    });
  }

  deleteStudentGroup(id: number) {
    this.studentGroupService.deleteStudentGroup(id).subscribe({
      next: (res) => {
        this.coreService.openSnackBar('Student Group deleted!', 'done');
        this.loadStudentGroups();
      },
      error: (err) => {
        console.log(err);
        this.coreService.openSnackBar(
          'Error deleting the student group... Check if the student group is reffered somewhere else',
          'done'
        );
      },
    });
  }

  openEditForm(data: any) {
    const dialogRef = this.dialog.open(StudentGroupDialogComponent, {
      data,
    });

    dialogRef.afterClosed().subscribe({
      next: (val) => {
        if (val) {
          this.loadStudentGroups();
        }
      },
    });
  }

  loadStudentGroups() {
    this.studentGroupService
      .getAllStudentGroups()
      .subscribe((studentGroups) => {
        this.dataSource.data = studentGroups;
        console.log(studentGroups);
        this.dataSource.paginator = this.paginator;
      });
  }

  addStudent() {
    this.studentGroupService
      .createStudentGroup(this.newStudentGroup)
      .subscribe((createdStudentGroup) => {
        this.dataSource.data = [...this.dataSource.data, createdStudentGroup];
        // this.table.renderRows();
        this.newStudentGroup = {};
      });
  }

}


