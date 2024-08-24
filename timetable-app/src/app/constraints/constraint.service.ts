import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Constraint } from '../model/timetableEntities';

@Injectable({
  providedIn: 'root',
})
export class ConstraintService {
  
  private apiUrl = 'http://localhost:8200/api/v1/constraints';

  constructor(private http: HttpClient) {}

  getAllConstraints(): Observable<Constraint[]> {
    return this.http.get<Constraint[]>(this.apiUrl);
  }

  getConstraintById(id: number): Observable<Constraint> {
    return this.http.get<Constraint>(`${this.apiUrl}/${id}`);
  }

  createConstraint(constraint: Constraint): Observable<Constraint> {
    return this.http.post<Constraint>(this.apiUrl, constraint);
  }

  updateConstraint(id: number, constraint: Constraint): Observable<Constraint> {
    return this.http.put<Constraint>(`${this.apiUrl}/${id}`, constraint);
  }

  deleteConstraint(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
