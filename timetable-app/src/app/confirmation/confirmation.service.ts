import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ConfirmationService {
  
  private apiUrl = 'http://localhost:8200/api/v1';

  constructor(private http: HttpClient) {}

  getLessonCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/lessons/count`);
  }

  getRoomCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/rooms/count`);
  }

  getConstraintCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/constraints/count`);
  }

  getTimeslotCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/timeslots/count`);
  }

  getTeacherCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/teachers/count`);
  }

  getStudentGroupCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/studentGroups/count`);
  }
  
}
