import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../model/user';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private apiUrl = 'http://localhost:8200/api/v1/auth';

  // Todo: BehaviorSubject also for User object
  private userSubject = new BehaviorSubject<User>({});
  //remember to control the logged state in the app
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  private showSidebarSubject = new BehaviorSubject<boolean>(false);
  showSidebar$ = this.showSidebarSubject.asObservable();

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<any> {
    const body = { email, password };
    return this.http.post(`${this.apiUrl}/authenticate`, body);
  }

  logout() {
    // remove user from local storage to log user out
    localStorage.removeItem('currentUser');
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

  getUserDetails(): Observable<any> {
    // let currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    // const reqHeaders= new HttpHeaders({
    //   'Content-Type': 'application/json',
    //   'Authorization': `Bearer ${currentUser.access_token}`,
    // }); , {headers: reqHeaders}
    return this.http.get<any>(`${this.apiUrl}/users/single`);
  }
}
