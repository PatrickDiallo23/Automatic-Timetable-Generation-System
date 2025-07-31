import { Component, OnInit } from '@angular/core';
import { User } from '../model/user';
import { LoginService } from '../login/login.service';
import { CoreService } from '../core/core.service';
import { TimetableService } from './timetable.service';
import { Data, HardMediumSoftScore, Lesson, Room, SemiGroup, Timeslot, Timetable } from '../model/timetableEntities';
import { MatDialog } from '@angular/material/dialog';
import { Observable, map, startWith } from 'rxjs';
import { FormControl, FormGroup } from '@angular/forms';
import { ScoreAnalysisDialogComponent } from './score-analysis-dialog/score-analysis-dialog.component';
import * as XLSX from 'xlsx';


@Component({
  selector: 'app-timetable',
  templateUrl: './timetable.component.html',
  styleUrls: ['./timetable.component.css'],
})
export class TimetableComponent implements OnInit {

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

  displayedColumns: string[] = ['subject', 'teacher', 'dayTime', 'room'];
  displayedTimetable: Lesson[] = [];
  studentGroupFormGroup = new FormGroup({
    studentGroupControl: new FormControl(''),
  });
  teacherFormGroup = new FormGroup({
    teacherControl: new FormControl(''),
  });

  isLoading: boolean = false;

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
    if (this.jobId != null && this.jobId != '') {
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
      console.log(this.score);

        // Populate student groups
        this.populateStudentGroups();
        this.populateTeachers();

        // Filter timetable initially
        this.filterTimetable('', '');
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

      console.log(selectedStudentGroup);

      const filteredTimetable = this.timetableData?.lessons?.filter(
        (lesson) =>
          lesson.studentGroup.studentGroup === selectedStudentGroup &&
          lesson.studentGroup.semiGroup === selectedSemiGroup
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
    headerRow.innerHTML = `
      <th><i class="material-icons" style="vertical-align: middle; margin-right: 8px;">book</i>Subject & Type</th>
      <th><i class="material-icons" style="vertical-align: middle; margin-right: 8px;">person</i>Teacher</th>
      <th><i class="material-icons" style="vertical-align: middle; margin-right: 8px;">schedule</i>Day & Time</th>
      <th><i class="material-icons" style="vertical-align: middle; margin-right: 8px;">room</i>Room & Building</th>
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

    console.log(sortedTimetable);
    sortedTimetable?.forEach((lesson, index) => {
      const timeslot = this.timetableData?.timeslots?.find(
        (slot) => slot.id === lesson.timeslot
      );
      const room = this.timetableData?.rooms?.find((r) => r.id === lesson.room);

      const row = table.insertRow();
      row.innerHTML = `
        <td>
          <div style="font-weight: 600; color: #673ab7; margin-bottom: 4px;">${lesson.subject}</div>
          <div style="font-size: 0.85rem; color: #666; font-style: italic;">${lesson.lessonType}</div>
        </td>
        <td>
          <div style="display: flex; align-items: center;">
            <i class="material-icons" style="font-size: 18px; margin-right: 8px; color: #673ab7;">account_circle</i>
            ${lesson.teacher.name}
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
      `;

      row.style.animation = `fadeIn 0.3s ease-in-out ${index * 0.05}s both`;
    });

    timetableContainer?.appendChild(table);
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
        (lesson) => lesson.teacher.name === selectedTeacher
      );

      console.log(filteredTimetable);
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
        console.log(dayOrderA);
        const dayOrderB =
          dayOrder[timeslotB.dayOfWeek as keyof typeof dayOrder];
        console.log(dayOrderB);

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

    console.log(sortedTimetable);
    sortedTimetable?.forEach((lesson, index) => {
      const timeslot = this.timetableData?.timeslots?.find(
        (slot) => slot.id === lesson.timeslot
      );
      const room = this.timetableData?.rooms?.find((r) => r.id === lesson.room);

      const row = table.insertRow();
      row.innerHTML = `
        <td>
          <div style="display: flex; align-items: center;">
            <i class="material-icons" style="font-size: 18px; margin-right: 8px; color: #673ab7;">group</i>
            <div>
              <div style="font-weight: 600; color: #673ab7;">${lesson.studentGroup.studentGroup}</div>
              <div style="font-size: 0.85rem; color: #666;">Subgroup ${lesson.studentGroup.semiGroup?.replace('SEMI_GROUP', '') || 'N/A'}</div>
            </div>
          </div>
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
    } else {
      //this.toggle === 'teacher'
      if (timetableContainer) timetableContainer.innerHTML = '';
      console.log(value);
      this.filterTeachers('');
      this.populateTeachers();
      this.teacherFormGroup.controls['teacherControl'].reset();
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
            'Building': room?.building || 'N/A'
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
          { wch: 15 }  // Building
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
}
