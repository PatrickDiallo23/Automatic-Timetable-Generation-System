import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Timeslot } from '../model/timetableEntities';

@Injectable({
  providedIn: 'root',
})
export class TimeslotService {

  private apiUrl = 'http://localhost:8200/api/v1/timeslots';

  constructor(private http: HttpClient) {}

  getAllTimeslots(): Observable<Timeslot[]> {
    return this.http.get<Timeslot[]>(this.apiUrl);
  }

  getTimeslotById(id: number): Observable<Timeslot> {
    return this.http.get<Timeslot>(`${this.apiUrl}/${id}`);
  }

  createTimeslot(timeslot: Timeslot): Observable<Timeslot> {
    return this.http.post<Timeslot>(this.apiUrl, timeslot);
  }

  updateTimeslot(id: number, timeslot: Timeslot): Observable<Timeslot> {
    return this.http.put<Timeslot>(`${this.apiUrl}/${id}`, timeslot);
  }

  deleteTimeslot(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
