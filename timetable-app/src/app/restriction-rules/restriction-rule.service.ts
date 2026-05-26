import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RestrictionRule } from '../model/timetableEntities';

@Injectable({
  providedIn: 'root',
})
export class RestrictionRuleService {

  private apiUrl = 'http://localhost:8200/api/v1/restriction-rules';

  constructor(private http: HttpClient) {}

  getAllRules(): Observable<RestrictionRule[]> {
    return this.http.get<RestrictionRule[]>(this.apiUrl);
  }

  getRuleById(id: number): Observable<RestrictionRule> {
    return this.http.get<RestrictionRule>(`${this.apiUrl}/${id}`);
  }

  createRule(rule: RestrictionRule): Observable<RestrictionRule> {
    return this.http.post<RestrictionRule>(this.apiUrl, rule);
  }

  updateRule(id: number, rule: RestrictionRule): Observable<RestrictionRule> {
    return this.http.put<RestrictionRule>(`${this.apiUrl}/${id}`, rule);
  }

  deleteRule(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
