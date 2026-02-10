import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RestrictionRule, RuleCombination, RuleTargetType } from '../model/timetableEntities';

const BASE_URL = 'http://localhost:8200/api/v1/restriction-rules';

/**
 * Service for managing restriction rules and their associations with lessons.
 */
@Injectable({
  providedIn: 'root'
})
export class RestrictionRuleService {

  constructor(private http: HttpClient) {}

  // ==================== Rule CRUD ====================

  getAll(targetType?: RuleTargetType): Observable<RestrictionRule[]> {
    let params = new HttpParams();
    if (targetType) {
      params = params.set('targetType', targetType);
    }
    return this.http.get<RestrictionRule[]>(BASE_URL, { params });
  }

  getById(id: number): Observable<RestrictionRule> {
    return this.http.get<RestrictionRule>(`${BASE_URL}/${id}`);
  }

  create(rule: RestrictionRule): Observable<RestrictionRule> {
    return this.http.post<RestrictionRule>(BASE_URL, rule);
  }

  update(id: number, rule: RestrictionRule): Observable<RestrictionRule> {
    return this.http.put<RestrictionRule>(`${BASE_URL}/${id}`, rule);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${BASE_URL}/${id}`);
  }

  // ==================== Lesson–Rule Associations ====================

  /** Get applied rules and combination settings for a lesson */
  getLessonRules(lessonId: number): Observable<LessonRulesResponse> {
    return this.http.get<LessonRulesResponse>(`${BASE_URL}/lessons/${lessonId}`);
  }

  /** Apply rules to a lesson with combination logic */
  applyRulesToLesson(lessonId: number, data: ApplyRulesRequest): Observable<LessonRulesResponse> {
    return this.http.put<LessonRulesResponse>(`${BASE_URL}/lessons/${lessonId}`, data);
  }

  /** Clear all rules from a lesson */
  clearLessonRules(lessonId: number): Observable<void> {
    return this.http.delete<void>(`${BASE_URL}/lessons/${lessonId}`);
  }
}

/** Response shape from GET /restriction-rules/lessons/{id} */
export interface LessonRulesResponse {
  lessonId: number;
  ruleIds: number[];
  roomRuleCombination: RuleCombination;
  timeslotRuleCombination: RuleCombination;
}

/** Request shape for PUT /restriction-rules/lessons/{id} */
export interface ApplyRulesRequest {
  ruleIds: number[];
  roomRuleCombination: RuleCombination;
  timeslotRuleCombination: RuleCombination;
}
