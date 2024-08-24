import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { StudentGroup } from '../model/timetableEntities';

@Injectable({
  providedIn: 'root',
})
export class StudentGroupService {

  private apiUrl = 'http://localhost:8200/api/v1/studentGroups';

  constructor(private http: HttpClient) {}

  getAllStudentGroups(): Observable<StudentGroup[]> {
    return this.http.get<StudentGroup[]>(this.apiUrl);
  }

  getStudentGroupById(id: number): Observable<StudentGroup> {
    return this.http.get<StudentGroup>(`${this.apiUrl}/${id}`);
  }

  createStudentGroup(student: StudentGroup): Observable<StudentGroup> {
    return this.http.post<StudentGroup>(this.apiUrl, student);
  }

  updateStudentGroup(id: number, student: StudentGroup): Observable<StudentGroup> {
    return this.http.put<StudentGroup>(`${this.apiUrl}/${id}`, student);
  }

  deleteStudentGroup(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

