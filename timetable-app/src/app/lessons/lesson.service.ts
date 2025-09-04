import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Lesson } from '../model/timetableEntities';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class LessonService {

  private apiUrl = environment.apiUrl + '/lessons';

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
}
