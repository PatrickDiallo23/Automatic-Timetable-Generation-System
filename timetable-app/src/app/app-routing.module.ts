import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RoomsComponent } from './rooms/rooms.component';
import { TimetableComponent } from './timetable/timetable.component';
import { ConfirmationComponent } from './confirmation/confirmation.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './guards/auth.guard';
import { StudentGroupComponent } from './student-group/student-group.component';
import { ConstraintsComponent } from './constraints/constraints.component';
import { TimeslotsComponent } from './timeslots/timeslots.component';
import { TeachersComponent } from './teachers/teachers.component';
import { LessonsComponent } from './lessons/lessons.component';


const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
  },
  { path: 'rooms', component: RoomsComponent, canActivate: [AuthGuard] },
  {
    path: 'timeslots',
    component: TimeslotsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'teachers',
    component: TeachersComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'studentGroups',
    component: StudentGroupComponent,
    canActivate: [AuthGuard],
  },
  { path: 'lessons', component: LessonsComponent, canActivate: [AuthGuard] },
  {
    path: 'constraints',
    component: ConstraintsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'confirmation',
    component: ConfirmationComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'timetable',
    component: TimetableComponent,
    canActivate: [AuthGuard],
  },
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
