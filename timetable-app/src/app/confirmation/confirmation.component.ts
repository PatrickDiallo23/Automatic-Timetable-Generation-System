import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService } from './confirmation.service';
import { TimetableService } from '../timetable/timetable.service';
import { CoreService } from '../core/core.service';
import { forkJoin } from 'rxjs';
import { Timetable } from '../model/timetableEntities';

@Component({
  selector: 'app-confirmation',
  templateUrl: './confirmation.component.html',
  styleUrls: ['./confirmation.component.css'],
})
export class ConfirmationComponent implements OnInit {
  loading = false;
  roomCount: number = 0;
  timeslotCount: number = 0;
  constraintCount: number = 0;
  teacherCount: number = 0;
  lessonCount: number = 0;
  studentGroupCount: number = 0;
  problemDuration: number | undefined;
  data?: Timetable;

  constructor(private router: Router, 
  private confirmationService: ConfirmationService,
   private timetableService: TimetableService,
  private coreService: CoreService) {}

  ngOnInit(): void {
    this.getEntitiesCount();
    this.getTimetableData();
  }

  getEntitiesCount() {
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
    this.timetableService.getTimetableData().subscribe((timetable) => {
      this.data = timetable;
      this.problemDuration = timetable.duration;
      console.log(this.data);
    });
  }

  generateTimetable() {
    if(this.data != null && this.problemDuration) { // && this.problemDuration != 0
      this.loading = true;
      // this.data.duration = this.problemDuration;
      this.timetableService.generateTimetable(this.data).subscribe({
        next: (response: any) => {
          const theJobId = response.jobId;
          console.log('jobId: ' + theJobId);
          // this.timetableService.setJobId(theJobId);
          localStorage.setItem('jobId', theJobId);
        },
        error: (err: any) => {
          console.error(err);
        },
      });
      this.coreService.openSnackBar(
        'Generating Timetable... Please wait ' +
          this.problemDuration +
          ' minutes!'
      );
      // Timeout before redirecting
      setTimeout(() => {
        // Redirect to the timetable view
        this.router.navigate(['/timetable']);
      }, this.problemDuration * 60000 + 3000); //this.problemDuration * 60000 (minutes) + 3 seconds
    } else {
    //Todo: add a message that covers all scenarios
    this.coreService.openSnackBar('No timetable data found or problem duration is not different from 0');
  }
  }
}

