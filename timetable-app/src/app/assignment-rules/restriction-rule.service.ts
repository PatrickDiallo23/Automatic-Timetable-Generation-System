import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApplyRulesRequest, RestrictionRule, RulePreview, RuleTargetType } from '../model/timetableEntities';

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

  getRulesByType(targetType: RuleTargetType): Observable<RestrictionRule[]> {
    return this.http.get<RestrictionRule[]>(`${this.apiUrl}/by-type/${targetType}`);
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

  previewRule(id: number): Observable<RulePreview> {
    return this.http.get<RulePreview>(`${this.apiUrl}/preview/${id}`);
  }

  getLessonRules(lessonId: number): Observable<RestrictionRule[]> {
    return this.http.get<RestrictionRule[]>(`${this.apiUrl}/lessons/${lessonId}`);
  }

  applyRulesToLesson(lessonId: number, request: ApplyRulesRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/lessons/${lessonId}`, request);
  }

  clearLessonRules(lessonId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/lessons/${lessonId}`);
  }
}
