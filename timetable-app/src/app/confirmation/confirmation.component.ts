import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ConfirmationService } from './confirmation.service';
import { TimetableService } from '../timetable/timetable.service';
import { CoreService } from '../core/core.service';
import { forkJoin } from 'rxjs';
import { Teacher, Timetable } from '../model/timetableEntities';
import { JsonImportService } from '../core/json-import.service';
import { LoginService } from '../login/login.service';
import { ExcelImportService } from '../core/excel-import.service';

@Component({
  selector: 'app-confirmation',
  templateUrl: './confirmation.component.html',
  styleUrls: ['./confirmation.component.css'],
})
export class ConfirmationComponent implements OnInit, OnDestroy {
  loading = false;
  roomCount: number = 0;
  timeslotCount: number = 0;
  constraintCount: number = 0;
  teacherCount: number = 0;
  lessonCount: number = 0;
  studentGroupCount: number = 0;
  problemDuration: number | undefined;
  data?: Timetable;
  importType = '';
  isImportMode = false;
  importDataLoaded = false;
  showDataDialog = false;
  currentEntityType = '';
  currentEntityData: any[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private confirmationService: ConfirmationService,
    private loginService: LoginService,
    private timetableService: TimetableService,
    private jsonImportService: JsonImportService,
    private excelImportService: ExcelImportService,
    private coreService: CoreService
  ) {}

  ngOnInit(): void {
    this.loginService.showEntityDialog$.subscribe((value) => {
      this.showDataDialog = value;
    });
    this.route.queryParams.subscribe((params) => {
      this.isImportMode = params['importMode'] === 'true';
      this.importType = params['importType'] || 'json';

      if (this.isImportMode) {
        this.loadImportedData();
      } else {
        this.getEntitiesCount();
        this.getTimetableData();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.isImportMode) {
      this.getImportService().clearImportedData().subscribe();
    }
  }

  private getImportService() {
    // Both services use the same IndexedDB, so we can use either one
    if (this.importType == 'json')
    return this.jsonImportService;

    return this.excelImportService;
  }

  private loadImportedData() {
    this.getImportService().getImportedData().subscribe({
      next: (importedData) => {
        if (importedData) {
          this.data = importedData;
          this.problemDuration = importedData.duration || 60; // Default duration if not specified
          this.calculateImportedDataCounts();
          this.importDataLoaded = true;
          console.log(
            `Loaded imported ${this.importType.toUpperCase()} data:`,
            this.data
          );
        } else {
          // No imported data found, redirect back to dashboard
          this.coreService.openSnackBar(
            `No imported data found. Please import a ${this.importType.toUpperCase()} file first.`
          );
          this.router.navigate(['/dashboard']);
        }
      },
      error: (error) => {
        console.error('Error loading imported data:', error);
        this.coreService.openSnackBar('Error loading imported data');
        this.router.navigate(['/dashboard']);
      },
    });
  }

  // Calculate counts from imported data
  private calculateImportedDataCounts() {
    if (!this.data) return;

    this.roomCount = this.data.rooms?.length || 0;
    this.timeslotCount = this.data.timeslots?.length || 0;
    this.lessonCount = this.data.lessons?.length || 0;

    // Calculate unique teachers and student groups from lessons
    const uniqueTeachers = new Set();
    const uniqueStudentGroups = new Set();

    this.data.lessons?.forEach((lesson) => {
      if (lesson.teacher?.name) {
        uniqueTeachers.add(lesson.teacher.name);
      }
      if (lesson.studentGroup?.name) {
        uniqueStudentGroups.add(lesson.studentGroup.id);
      }
    });

    this.teacherCount = uniqueTeachers.size;
    this.studentGroupCount = uniqueStudentGroups.size;

    // Set constraint count to 0 for imported data (or calculate if needed)
    const constraintConfig = this.data?.timetableConstraintConfiguration;
    this.constraintCount = 0;

    if (constraintConfig) {
      for (const key in constraintConfig) {
        const value = constraintConfig[key];
        const [hardStr, mediumStr, softStr] = value.split('/');
        const hard = parseInt(hardStr, 10);
        const medium = parseInt(mediumStr, 10);
        const soft = parseInt(softStr, 10);

        if (hard > 0 || medium > 0 || soft > 0) {
          this.constraintCount++;
        }
      }
    }
  }

  getEntitiesCount() {
    if (this.isImportMode) return; // Skip if in import mode

    forkJoin([
      this.confirmationService.getConstraintCount(),
      this.confirmationService.getRoomCount(),
      this.confirmationService.getTimeslotCount(),
      this.confirmationService.getTeacherCount(),
      this.confirmationService.getLessonCount(),
      this.confirmationService.getStudentGroupCount(),
    ]).subscribe(
      ([
        constraintCount,
        roomCount,
        timeslotCount,
        teacherCount,
        lessonCount,
        studentGroupCount,
      ]) => {
        this.constraintCount = constraintCount;
        this.roomCount = roomCount;
        this.timeslotCount = timeslotCount;
        this.teacherCount = teacherCount;
        this.lessonCount = lessonCount;
        this.studentGroupCount = studentGroupCount;
      }
    );
  }

  getTimetableData() {
    if (this.isImportMode) return; // Skip if in import mode

    this.timetableService.getTimetableData().subscribe((timetable) => {
      this.data = timetable;
      this.problemDuration = timetable.duration;
      console.log(this.data);
    });
  }

  generateTimetable() {
    if (this.data != null && this.problemDuration) {
      // && this.problemDuration != 0
      this.loading = true;
      this.data.duration = this.problemDuration;
      this.timetableService.generateTimetable(this.data).subscribe({
        next: (response: any) => {
          const theJobId = response.jobId;
          console.log('jobId: ' + theJobId);
          // this.timetableService.setJobId(theJobId);
          localStorage.setItem('jobId', theJobId);
          // Clear imported data after successful generation
          if (this.isImportMode) {
            this.getImportService().clearImportedData().subscribe();
          }
          const dataSource = this.isImportMode
            ? `imported ${this.importType.toUpperCase()}`
            : 'database';
          this.coreService.openSnackBar(
            `Generating Timetable from ${dataSource}... Please wait ${this.problemDuration} minutes!`
          );
          // Timeout before redirecting
          setTimeout(() => {
            // Redirect to the timetable view
            this.router.navigate(['/timetable']);
          }, (this.problemDuration || 2) * 60000 + 3000); //this.problemDuration * 60000 (minutes) + 3 seconds
        },
        error: (err: any) => {
          console.error(err);
          this.loading = false;
        },
      });

    } else {
      // Todo: add a message that covers all scenarios
      this.coreService.openSnackBar('No timetable data found or problem duration is not different from 0');
    }
  }

  goBackToDashboard() {
    this.loginService.setShowSidebar(false);
    this.router.navigate(['/dashboard']);
  }

  handleEntityCardClick(entityType: string): void {
    if (this.isImportMode) {
      // Show dialog with imported data
      this.showDataForEntity(entityType);
    } else {
      // Navigate to the specific page
      this.navigateToEntityPage(entityType);
    }
  }

  private showDataForEntity(entityType: string): void {
    this.currentEntityType = entityType;

    if (!this.data) {
      this.coreService.openSnackBar('No data available to display');
      return;
    }

    switch (entityType) {
      case 'rooms':
        this.currentEntityData = this.data.rooms || [];
        break;
      case 'timeslots':
        this.currentEntityData = this.data.timeslots || [];
        break;
      case 'teachers':
        // Extract unique teachers from lessons
        const teacherMap = new Map<string, Teacher>();
        this.data.lessons?.forEach((lesson) => {
            if (lesson.teacher) {
              const key: string =
                lesson.teacher?.id !== undefined
                  ? String(lesson.teacher.id)
                  : lesson.teacher?.name ?? `unknown_${Math.random()}`;
              if (!teacherMap.has(key)) {
                teacherMap.set(key, {
                  name: lesson.teacher.name,
                  preferredTimeslots: lesson.teacher.preferredTimeslots ? [...lesson.teacher.preferredTimeslots] : []
                });
              } else {
                const existing = teacherMap.get(key)!;

                // Merge preferred timeslots
                if (lesson.teacher.preferredTimeslots?.length) {
                  lesson.teacher.preferredTimeslots.forEach(slot => {
                    const alreadyExists = existing.preferredTimeslots?.some(
                      s => s.dayOfWeek === slot.dayOfWeek &&
                           s.startTime === slot.startTime &&
                           s.endTime === slot.endTime
                    );
                    if (!alreadyExists) {
                      existing.preferredTimeslots?.push(slot);
                    }
                  });
                }
              }
            }
          });

          this.currentEntityData = Array.from(teacherMap.values());
          break;
      case 'lessons':
        this.currentEntityData = this.data.lessons || [];
        break;
      case 'studentGroups':
        // Extract unique student groups from lessons
        const groupSet = new Set<any>();
        const groupMap = new Map();
        this.data.lessons?.forEach((lesson) => {
          if (lesson.studentGroup) {
            const key = lesson.studentGroup.id || lesson.studentGroup.name;
            if (!groupMap.has(key)) {
              groupMap.set(key, lesson.studentGroup);
            }
          }
        });
        this.currentEntityData = Array.from(groupMap.values());
        break;
      case 'constraints':
        const rawConstraints = this.data?.timetableConstraintConfiguration || {};
        this.currentEntityData = Object.entries(rawConstraints)
          .map(([key, value]) => {
            const constraintString = value as string;
            const [hardStr, mediumStr, softStr] = constraintString.split('/');
            const hard = parseInt(hardStr, 10);
            const medium = parseInt(mediumStr, 10);
            const soft = parseInt(softStr, 10);

            return {
              name: this.formatConstraintName(key),
              hard,
              medium,
              soft,
            };
          })
          .filter((c) => c.hard > 0 || c.medium > 0 || c.soft > 0);
        break;
      default:
        this.currentEntityData = [];
    }

    this.showDataDialog = true;
    this.loginService.setShowEntityDialog(true);
  }

  private navigateToEntityPage(entityType: string): void {
    this.loginService.setShowSidebar(true);

    const routeMap: { [key: string]: string } = {
      rooms: '/rooms',
      timeslots: '/timeslots',
      teachers: '/teachers',
      lessons: '/lessons',
      studentGroups: '/student-groups',
      constraints: '/constraints',
    };

    const route = routeMap[entityType];
    if (route) {
      this.router.navigate([route]);
    } else {
      this.coreService.openSnackBar('Page not found for ' + entityType);
    }
  }

  closeDataDialog(): void {
    this.showDataDialog = false;
    this.loginService.setShowEntityDialog(false);
    this.currentEntityType = '';
    this.currentEntityData = [];
  }

  private formatConstraintName(key: string): string {
    // Split camelCase into words and capitalize
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase());
  }
}

