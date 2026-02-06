import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Lesson } from '../model/timetableEntities';

@Injectable({
  providedIn: 'root',
})
export class LessonService {
  
  private apiUrl = 'http://localhost:8200/api/v1/lessons';

  constructor(private http: HttpClient) {}

  getAllLessons(): Observable<Lesson[]> {
    return this.http.get<Lesson[]>(this.apiUrl);
  }

  getLessonById(id: number): Observable<Lesson> {
    return this.http.get<Lesson>(`${this.apiUrl}/${id}`);
  }

  createLesson(lesson: Lesson): Observable<Lesson> {
    return this.http.post<Lesson>(this.apiUrl, lesson);
  }

  updateLesson(id: number, lesson: Lesson): Observable<Lesson> {
    return this.http.put<Lesson>(`${this.apiUrl}/${id}`, lesson);
  }

  deleteLesson(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  updatePinning(id: number, pinned: boolean, timeslotId?: number, roomId?: number): Observable<Lesson> {
    let params = `?pinned=${pinned}`;
    if (timeslotId !== undefined && timeslotId !== null) {
      params += `&timeslotId=${timeslotId}`;
    }
    if (roomId !== undefined && roomId !== null) {
      params += `&roomId=${roomId}`;
    }
    return this.http.patch<Lesson>(`${this.apiUrl}/${id}/pin${params}`, {});
  }
}
