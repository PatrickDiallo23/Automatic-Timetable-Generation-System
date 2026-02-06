import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SidebarComponent } from './sidebar/sidebar.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatListModule } from '@angular/material/list';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatTableModule } from '@angular/material/table';
import { MatRadioModule } from '@angular/material/radio';
import { FormsModule } from '@angular/forms';
import { TimetableComponent } from './timetable/timetable.component';
import { MatInputModule } from '@angular/material/input';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { ReactiveFormsModule } from '@angular/forms';
import { RoomsComponent } from './rooms/rooms.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { ConfirmationComponent } from './confirmation/confirmation.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LoginComponent } from './login/login.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { AuthGuard } from './guards/auth.guard';
import { JwtInterceptor } from './helpers/jwt.interceptor';
import { RoomDialogComponent } from './rooms/room-dialog/room-dialog.component';
import { StudentGroupComponent } from './student-group/student-group.component';
import { StudentGroupDialogComponent } from './student-group/student-group-dialog/student-group-dialog.component';
import { ConstraintsComponent } from './constraints/constraints.component';
import { ConstraintDialogComponent } from './constraints/constraint-dialog/constraint-dialog.component';
import { TimeslotsComponent } from './timeslots/timeslots.component';
import { TimeslotDialogComponent } from './timeslots/timeslot-dialog/timeslot-dialog.component';
import { TeachersComponent } from './teachers/teachers.component';
import { TeacherDialogComponent } from './teachers/teacher-dialog/teacher-dialog.component';
import { PrefferedTimeslotsDialogComponent } from './teachers/preffered-timeslots-dialog/preffered-timeslots-dialog.component';
import { LessonsComponent } from './lessons/lessons.component';
import { LessonDialogComponent } from './lessons/lesson-dialog/lesson-dialog.component';
import { CountdownTimerComponent } from './helpers/countdown-timer/countdown-timer.component';
import { ScoreAnalysisDialogComponent } from './timetable/score-analysis-dialog/score-analysis-dialog.component';
import { BenchmarkDialogComponent } from './dashboard/benchmark-dialog/benchmark-dialog.component';
import { EditLessonDialogComponent } from './timetable/edit-lesson-dialog/edit-lesson-dialog.component';
import { ImpactAnalysisDialogComponent } from './timetable/impact-analysis-dialog/impact-analysis-dialog.component';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';


@NgModule({
  declarations: [
    AppComponent,
    SidebarComponent,
    TimetableComponent,
    RoomsComponent,
    ConfirmationComponent,
    DashboardComponent,
    LoginComponent,
    RoomDialogComponent,
    StudentGroupComponent,
    StudentGroupDialogComponent,
    ConstraintsComponent,
    ConstraintDialogComponent,
    TimeslotsComponent,
    TimeslotDialogComponent,
    TeachersComponent,
    TeacherDialogComponent,
    PrefferedTimeslotsDialogComponent,
    LessonsComponent,
    LessonDialogComponent,
    CountdownTimerComponent,
    ScoreAnalysisDialogComponent,
    BenchmarkDialogComponent,
    EditLessonDialogComponent,
    ImpactAnalysisDialogComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatSidenavModule,
    MatListModule,
    MatButtonToggleModule,
    MatCardModule,
    MatChipsModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatTableModule,
    FormsModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatToolbarModule,
    MatIconModule,
    MatDialogModule,
    MatSortModule,
    MatSelectModule,
    MatPaginatorModule,
    MatGridListModule,
    MatAutocompleteModule,
    MatRadioModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    HttpClientModule,
    MatDividerModule,
    MatTooltipModule,
    MatSlideToggleModule,
  ],
  providers: [
    AuthGuard,
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
