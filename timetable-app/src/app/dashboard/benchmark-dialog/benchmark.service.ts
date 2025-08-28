import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { JsonImportService } from '../../core/json-import.service';
import { map, Observable, switchMap } from 'rxjs';
import { BenchmarkRequest, BenchmarkResponse } from '../../model/timetableEntities';

@Injectable({
  providedIn: 'root',
})
export class BenchmarkService {
  private apiUrl = 'http://localhost:8200/api/v1/benchmarks';

  constructor(
    private http: HttpClient,
    private jsonImportService: JsonImportService
  ) {}

  /**
   * Runs a benchmark either with imported timetable or DB datasets.
   * @param useImported true → use imported JSON timetable; false → use database datasets
   */
  runBenchmark(
    useImported: boolean,
  ): Observable<string> {
    if (useImported) {
      return this.jsonImportService.getImportedData().pipe(
        switchMap((timetable) => {
          if (!timetable) {
            throw new Error('No imported timetable found');
          }
          const request: BenchmarkRequest = { source: 'imported', timetable };
          return this.http.post<BenchmarkResponse>(
            `${this.apiUrl}/run`,
            request
          );
        }),
        map((res) => res.reportUrl)
      );
    } else {
      const request: BenchmarkRequest = { source: 'database'
      };
      return this.http
        .post<BenchmarkResponse>(`${this.apiUrl}/run`, request)
        .pipe(map((res) => res.reportUrl));
    }
  }

  aggregateBenchmark() :Observable<void>{
    return this.http.post<void>(`${this.apiUrl}/aggregate`, {});
  }
}
