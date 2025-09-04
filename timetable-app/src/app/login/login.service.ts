import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../model/user';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private apiUrl = environment.apiUrl + '/auth';

  // Todo: BehaviorSubject also for User object
  private userSubject = new BehaviorSubject<User>({});
  //remember to control the logged state in the app
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  private showSidebarSubject = new BehaviorSubject<boolean>(false);
  showSidebar$ = this.showSidebarSubject.asObservable();
  private showEntityDialogSubject = new BehaviorSubject<boolean>(false);
  showEntityDialog$ = this.showEntityDialogSubject.asObservable();

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<any> {
    const body = { email, password };
    return this.http.post(`${this.apiUrl}/authenticate`, body);
  }

  logout() : Observable<any> {
    const currentUser = localStorage.getItem('currentUser');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${currentUser ? JSON.parse(currentUser).access_token : ''}`,
    });
    return this.http.post(`${this.apiUrl}/logout`, {}, { headers });

  }

  setAuthenticated(value: boolean) {
    this.isAuthenticatedSubject.next(value);
  }

  get isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  setUser(value: User) {
    this.userSubject.next(value);
  }

  get userConnected(): User {
    return this.userSubject.value;
  }

  setShowSidebar(value: boolean) {
    this.showSidebarSubject.next(value);
  }

  get showSidebar(): boolean {
    return this.showSidebarSubject.value;
  }

  setShowEntityDialog(value: boolean) {
    this.showEntityDialogSubject.next(value);
  }

  get showEntityDialog(): boolean {
    return this.showEntityDialogSubject.value;
  }

  getUserDetails(): Observable<any> {
    // let currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    // const reqHeaders= new HttpHeaders({
    //   'Content-Type': 'application/json',
    //   'Authorization': `Bearer ${currentUser.access_token}`,
    // }); , {headers: reqHeaders}
    return this.http.get<any>(`${this.apiUrl}/users/single`);
  }
}
