import { Injectable } from '@angular/core';
import { Observable, from, throwError } from 'rxjs';
import { map, catchError, mergeMap } from 'rxjs/operators';
import {
  Timetable,
  LessonType,
  Year,
} from '../model/timetableEntities';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  data?: Timetable;
}

@Injectable({
  providedIn: 'root',
})
export class JsonImportService {
  private dbName = 'TimetableImportDB';
  private dbVersion = 1;
  private storeName = 'importedData';
  private db: IDBDatabase | null = null;

  constructor() {
    this.initDB();
  }

  private initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'id' });
        }
      };
    });
  }

  // Store imported timetable data in IndexedDB
  storeImportedData(data: Timetable): Observable<void> {
    return from(this.initDB()).pipe(
      mergeMap(() => {
        if (!this.db) throw new Error('Database not initialized');

        const transaction = this.db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);

        // Store with a known key for retrieval
        store.put({ id: 'current_import', data: data, timestamp: Date.now() });

        return new Promise<void>((resolve, reject) => {
          transaction.oncomplete = () => resolve();
          transaction.onerror = () => reject(transaction.error);
        });
      }),
      catchError((error) => throwError(() => error))
    );
  }

  // Retrieve imported timetable data from IndexedDB
  getImportedData(): Observable<Timetable | null> {
    return from(this.initDB()).pipe(
      mergeMap(() => {
        if (!this.db) throw new Error('Database not initialized');

        const transaction = this.db.transaction([this.storeName], 'readonly');
        const store = transaction.objectStore(this.storeName);
        const request = store.get('current_import');

        return new Promise<Timetable | null>((resolve, reject) => {
          request.onsuccess = () => {
            const result = request.result;
            resolve(result ? result.data : null);
          };
          request.onerror = () => reject(request.error);
        });
      }),
      catchError((error) => throwError(() => error))
    );
  }

  // Clear imported data
  clearImportedData(): Observable<void> {
    return from(this.initDB()).pipe(
      mergeMap(() => {
        if (!this.db) throw new Error('Database not initialized');

        const transaction = this.db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        store.delete('current_import');

        return new Promise<void>((resolve, reject) => {
          transaction.oncomplete = () => resolve();
          transaction.onerror = () => reject(transaction.error);
        });
      }),
      catchError((error) => throwError(() => error))
    );
  }

  // Check if imported data exists
  hasImportedData(): Observable<boolean> {
    return this.getImportedData().pipe(
      map((data) => data !== null),
      catchError(() => from([false]))
    );
  }

  // Validate JSON file structure
  validateJsonFile(file: File): Observable<ValidationResult> {
    return new Observable<ValidationResult>((observer) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const jsonString = e.target?.result as string;
          const data = JSON.parse(jsonString);

          const validation = this.validateTimetableStructure(data);
          observer.next(validation);
          observer.complete();
        } catch (error) {
          observer.next({
            isValid: false,
            errors: ['Invalid JSON format: ' + (error as Error).message],
          });
          observer.complete();
        }
      };

      reader.onerror = () => {
        observer.next({
          isValid: false,
          errors: ['Failed to read file'],
        });
        observer.complete();
      };

      reader.readAsText(file);
    });
  }

  private validateTimetableStructure(data: any): ValidationResult {
    const errors: string[] = [];

    // Check if data is an object
    if (!data || typeof data !== 'object') {
      errors.push('Root data must be an object');
      return { isValid: false, errors };
    }

    // Validate timeslots
    if (data.timeslots) {
      if (!Array.isArray(data.timeslots)) {
        errors.push('timeslots must be an array');
      } else {
        data.timeslots.forEach((timeslot: any, index: number) => {
          if (!this.isValidTimeslot(timeslot)) {
            errors.push(`Invalid timeslot at index ${index}`);
          }
        });
      }
    }

    // Validate rooms
    if (data.rooms) {
      if (!Array.isArray(data.rooms)) {
        errors.push('rooms must be an array');
      } else {
        data.rooms.forEach((room: any, index: number) => {
          if (!this.isValidRoom(room)) {
            errors.push(`Invalid room at index ${index}`);
          }
        });
      }
    }

    // Validate lessons
    if (data.lessons) {
      if (!Array.isArray(data.lessons)) {
        errors.push('lessons must be an array');
      } else {
        data.lessons.forEach((lesson: any, index: number) => {
          if (!this.isValidLesson(lesson)) {
            errors.push(`Invalid lesson at index ${index}`);
          }
        });
      }
    }

    // Validate duration
    if (
      data.duration !== undefined &&
      (typeof data.duration !== 'number' || data.duration <= 0)
    ) {
      errors.push('duration must be a positive number');
    }

    return {
      isValid: errors.length === 0,
      errors,
      data: errors.length === 0 ? (data as Timetable) : undefined,
    };
  }

  private isValidTimeslot(timeslot: any): boolean {
    return (
      typeof timeslot === 'object' &&
      typeof timeslot.dayOfWeek === 'string' &&
      typeof timeslot.startTime === 'string' &&
      typeof timeslot.endTime === 'string'
    );
  }

  private isValidRoom(room: any): boolean {
    return (
      typeof room === 'object' &&
      typeof room.name === 'string' &&
      typeof room.capacity === 'number' &&
      room.capacity > 0
    );
  }

  private isValidLesson(lesson: any): boolean {
    return (
      typeof lesson === 'object' &&
      typeof lesson.subject === 'string' &&
      this.isValidTeacher(lesson.teacher) &&
      this.isValidStudentGroup(lesson.studentGroup) &&
      Object.values(LessonType).includes(lesson.lessonType) &&
      Object.values(Year).includes(lesson.year) &&
      typeof lesson.duration === 'number' &&
      lesson.duration > 0
    );
  }

  private isValidTeacher(teacher: any): boolean {
    return typeof teacher === 'object' && typeof teacher.name === 'string';
  }

  private isValidStudentGroup(studentGroup: any): boolean {
    return (
      typeof studentGroup === 'object' &&
      typeof studentGroup.name === 'string' &&
      Object.values(Year).includes(studentGroup.year) &&
      typeof studentGroup.numberOfStudents === 'number' &&
      studentGroup.numberOfStudents > 0
    );
  }
}
