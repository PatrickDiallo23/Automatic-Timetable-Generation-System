import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Room } from '../model/timetableEntities';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class RoomService {

  private apiUrl = environment.apiUrl + '/rooms';

  constructor(private http: HttpClient) {}

  getAllRooms(): Observable<Room[]> {
    return this.http.get<Room[]>(this.apiUrl);
  }

  getRoomById(id: number): Observable<Room> {
    return this.http.get<Room>(`${this.apiUrl}/${id}`);
  }

  createRoom(room: Room): Observable<Room> {
    return this.http.post<Room>(this.apiUrl, room);
  }

  updateRoom(id: number, room: Room): Observable<Room> {
    return this.http.put<Room>(`${this.apiUrl}/${id}`, room);
  }

  deleteRoom(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
