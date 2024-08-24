import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Timetable } from '../model/timetableEntities';

@Injectable({
  providedIn: 'root',
})
export class TimetableService {
  
  private apiUrl = 'http://localhost:8200/api/v1/timetables';
  private jobId = new BehaviorSubject('');

  constructor(private http: HttpClient) {}

  getJobId(): Observable<string> {
    return of(this.jobId.value);
  }

  setJobId(jobId: string) {
    this.jobId.next(jobId);
  }

  getTimetableData(): Observable<Timetable>{
    return this.http.get<Timetable>(`${this.apiUrl}`);
  }

  generateTimetable(timetable: Timetable): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}`, timetable);
  }

  getTimetable(id: string): Observable<Timetable>{
    return this.http.get<Timetable>(`${this.apiUrl}/${id}`)
  }
}
