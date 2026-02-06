import { Injectable } from '@angular/core';
import { Observable, from, throwError } from 'rxjs';
import { catchError, mergeMap } from 'rxjs/operators';
import * as XLSX from 'xlsx';
import {
  Lesson,
  LessonType,
  Room,
  SemiGroup,
  StudentGroup,
  Teacher,
  TeacherTimeslot,
  Timeslot,
  Timetable,
  Year,
} from '../model/timetableEntities';

export interface ExcelValidationResult {
  isValid: boolean;
  errors: string[];
  data?: Timetable;
  warnings?: string[];
}

@Injectable({
  providedIn: 'root',
})
export class ExcelImportService {
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

  // Store imported Excel data in IndexedDB
  storeImportedData(data: Timetable): Observable<void> {
    return from(this.initDB()).pipe(
      mergeMap(() => {
        if (!this.db) throw new Error('Database not initialized');
        const transaction = this.db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        store.put({
          id: 'current_import',
          data: data,
          timestamp: Date.now(),
          source: 'excel',
        });
        return new Promise<void>((resolve, reject) => {
          transaction.oncomplete = () => resolve();
          transaction.onerror = () => reject(transaction.error);
        });
      }),
      catchError((error) => throwError(() => error))
    );
  }

  // Get imported data from IndexedDB
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

  // Main Excel processing method
  validateExcelFile(file: File): Observable<ExcelValidationResult> {
    return new Observable<ExcelValidationResult>((observer) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });

          const validation = this.processExcelWorkbook(workbook);
          observer.next(validation);
          observer.complete();
        } catch (error) {
          observer.next({
            isValid: false,
            errors: ['Failed to read Excel file: ' + (error as Error).message],
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

      reader.readAsArrayBuffer(file);
    });
  }

  private processExcelWorkbook(workbook: XLSX.WorkBook): ExcelValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Extract data from each sheet
      const timeslots = this.extractTimeslots(workbook, errors);
      const rooms = this.extractRooms(workbook, errors);
      const teachers = this.extractTeachers(workbook, errors);
      const studentGroups = this.extractStudentGroups(workbook, errors);
      const lessons = this.extractLessons(
        workbook,
        errors,
        warnings,
        teachers,
        studentGroups,
        timeslots,
        rooms
      );
      const config = this.extractConfiguration(workbook, warnings);

      if (errors.length > 0) {
        return { isValid: false, errors, warnings };
      }

      // Create the timetable object
      const timetable: Timetable = {
        timeslots,
        rooms,
        lessons,
        duration: config.duration || 60, // Default duration
        timetableConstraintConfiguration: config.constraints || {},
        score: null,
        solverStatus: null
      };

      return {
        isValid: true,
        errors: [],
        warnings,
        data: timetable,
      };
    } catch (error) {
      errors.push('Error processing Excel data: ' + (error as Error).message);
      return { isValid: false, errors, warnings };
    }
  }

  private extractTimeslots(
    workbook: XLSX.WorkBook,
    errors: string[]
  ): Timeslot[] {
    const sheetName = 'Timeslots';
    if (!workbook.Sheets[sheetName]) {
      errors.push(`Missing required sheet: ${sheetName}`);
      return [];
    }

    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    const timeslots: Timeslot[] = [];

    data.forEach((row: any, index: number) => {
      try {
        console.log(`Timeslots row ${index + 2}:`, row);

        if (
          !this.hasValue(row.id) ||
          !this.hasValue(row.dayOfWeek) ||
          !this.hasValue(row.startTime) ||
          !this.hasValue(row.endTime)
        ) {
          errors.push(
            `Timeslots sheet row ${index + 2}: Missing required fields (id: ${
              row.id
            }, dayOfWeek: ${row.dayOfWeek}, startTime: ${
              row.startTime
            }, endTime: ${row.endTime})`
          );
          return;
        }

        timeslots.push({
          id: Number(row.id),
          dayOfWeek: String(row.dayOfWeek).toUpperCase(),
          startTime: this.formatTime(row.startTime),
          endTime: this.formatTime(row.endTime),
        });
      } catch (error) {
        errors.push(
          `Timeslots sheet row ${index + 2}: ${(error as Error).message}`
        );
      }
    });

    return timeslots;
  }

  private extractRooms(workbook: XLSX.WorkBook, errors: string[]): Room[] {
    const sheetName = 'Rooms';
    if (!workbook.Sheets[sheetName]) {
      errors.push(`Missing required sheet: ${sheetName}`);
      return [];
    }

    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    const rooms: Room[] = [];

    data.forEach((row: any, index: number) => {
      try {
        console.log(`Rooms row ${index + 2}:`, row);

        if (
          !this.hasValue(row.id) ||
          !this.hasValue(row.name) ||
          !this.hasValue(row.capacity)
        ) {
          errors.push(
            `Rooms sheet row ${index + 2}: Missing required fields (id: ${
              row.id
            }, name: ${row.name}, capacity: ${row.capacity})`
          );
          return;
        }

        rooms.push({
          id: Number(row.id),
          name: String(row.name),
          capacity: Number(row.capacity),
          building: this.hasValue(row.building)
            ? String(row.building)
            : undefined,
        });
      } catch (error) {
        errors.push(
          `Rooms sheet row ${index + 2}: ${(error as Error).message}`
        );
      }
    });

    return rooms;
  }

  private extractTeachers(
    workbook: XLSX.WorkBook,
    errors: string[]
  ): Teacher[] {
    const sheetName = 'Teachers';
    if (!workbook.Sheets[sheetName]) {
      errors.push(`Missing required sheet: ${sheetName}`);
      return [];
    }

    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    const teachers: Teacher[] = [];

    data.forEach((row: any, index: number) => {
      try {
        console.log(`Teachers row ${index + 2}:`, row);

        if (!this.hasValue(row.id) || !this.hasValue(row.name)) {
          errors.push(
            `Teachers sheet row ${index + 2}: Missing required fields (id: ${
              row.id
            }, name: ${row.name})`
          );
          return;
        }

        // Parse preferred timeslots
        const preferredTimeslots: TeacherTimeslot[] =
          this.parsePreferredTimeslots(
            row.preferredTimeslots,
            index + 2,
            errors
          );

        teachers.push({
          id: Number(row.id),
          name: String(row.name).trim(),
          preferredTimeslots: preferredTimeslots,
        });
      } catch (error) {
        errors.push(
          `Teachers sheet row ${index + 2}: ${(error as Error).message}`
        );
      }
    });

    return teachers;
  }

  private extractStudentGroups(
    workbook: XLSX.WorkBook,
    errors: string[]
  ): StudentGroup[] {
    const sheetName = 'StudentGroups';
    if (!workbook.Sheets[sheetName]) {
      errors.push(`Missing required sheet: ${sheetName}`);
      return [];
    }

    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    const studentGroups: StudentGroup[] = [];

    data.forEach((row: any, index: number) => {
      try {
        console.log(`StudentGroups row ${index + 2}:`, row);

        // Check required fields
        if (
          !this.hasValue(row.id) ||
          !this.hasValue(row.name) ||
          !this.hasValue(row.studentGroup) ||
          !this.hasValue(row.semiGroup) ||
          !this.hasValue(row.year) ||
          !this.hasValue(row.numberOfStudents)
        ) {
          errors.push(
            `StudentGroups sheet row ${
              index + 2
            }: Missing required fields (id: ${row.id}, name: ${
              row.name
            }, year: ${row.year}, numberOfStudents: ${row.numberOfStudents})`
          );
          return;
        }

        // Validate enum values
        const year = String(row.year).toUpperCase() as Year;
        if (!Object.values(Year).includes(year)) {
          errors.push(
            `StudentGroups sheet row ${index + 2}: Invalid year value: ${
              row.year
            }`
          );
          return;
        }

        let semiGroup: SemiGroup | undefined;
        if (this.hasValue(row.semiGroup)) {
          semiGroup = String(row.semiGroup).toUpperCase() as SemiGroup;
          if (!Object.values(SemiGroup).includes(semiGroup)) {
            errors.push(
              `StudentGroups sheet row ${index + 2}: Invalid semiGroup value: ${
                row.semiGroup
              }`
            );
            return;
          }
        }

        studentGroups.push({
          id: Number(row.id),
          year,
          name: String(row.name),
          studentGroup: this.hasValue(row.studentGroup)
            ? String(row.studentGroup)
            : undefined,
          semiGroup,
          numberOfStudents: Number(row.numberOfStudents),
        });
      } catch (error) {
        errors.push(
          `StudentGroups sheet row ${index + 2}: ${(error as Error).message}`
        );
      }
    });

    return studentGroups;
  }

  private extractLessons(
    workbook: XLSX.WorkBook,
    errors: string[],
    warnings: string[],
    teachers: Teacher[],
    studentGroups: StudentGroup[],
    timeslots: Timeslot[],
    rooms: Room[]
  ): Lesson[] {
    const sheetName = 'Lessons';
    if (!workbook.Sheets[sheetName]) {
      errors.push(`Missing required sheet: ${sheetName}`);
      return [];
    }

    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    const lessons: Lesson[] = [];

    data.forEach((row: any, index: number) => {
      try {
        // Debug: log the row to see what we're getting
        console.log(`Lessons row ${index + 2}:`, row);

        if (
          !this.hasValue(row.id) ||
          !this.hasValue(row.subject) ||
          !this.hasValue(row.teacherId) ||
          !this.hasValue(row.studentGroupId) ||
          !this.hasValue(row.lessonType) ||
          !this.hasValue(row.year) ||
          !this.hasValue(row.duration)
        ) {
          errors.push(
            `Lessons sheet row ${index + 2}: Missing required fields (id: ${
              row.id
            }, subject: ${row.subject}, teacherId: ${
              row.teacherId
            }, studentGroupId: ${row.studentGroupId}, lessonType: ${
              row.lessonType
            }, year: ${row.year}, duration: ${row.duration})`
          );
          return;
        }

        // Find teacher and student group by ID
        const teacher = teachers.find((t) => t.id === Number(row.teacherId));
        const studentGroup = studentGroups.find(
          (sg) => sg.id === Number(row.studentGroupId)
        );

        if (!teacher) {
          errors.push(
            `Lessons sheet row ${index + 2}: Teacher with ID ${
              row.teacherId
            } not found`
          );
          return;
        }

        if (!studentGroup) {
          errors.push(
            `Lessons sheet row ${index + 2}: Student group with ID ${
              row.studentGroupId
            } not found`
          );
          return;
        }

        // Validate enum values
        const lessonType = String(row.lessonType).toUpperCase() as LessonType;
        if (!Object.values(LessonType).includes(lessonType)) {
          errors.push(
            `Lessons sheet row ${index + 2}: Invalid lessonType value: ${
              row.lessonType
            }`
          );
          return;
        }

        const year = String(row.year).toUpperCase() as Year;
        if (!Object.values(Year).includes(year)) {
          errors.push(
            `Lessons sheet row ${index + 2}: Invalid year value: ${row.year}`
          );
          return;
        }

        // Parse pinned field
        const isPinned = this.hasValue(row.pinned) 
          ? (String(row.pinned).toLowerCase() === 'true' || row.pinned === true) 
          : false;

        // Look up timeslot by ID if provided
        let timeslotRef: number | null = null;
        if (this.hasValue(row.timeslotId)) {
          const timeslotId = Number(row.timeslotId);
          const foundTimeslot = timeslots.find(ts => ts.id === timeslotId);
          if (foundTimeslot) {
            timeslotRef = foundTimeslot.id ?? null;
          } else {
            warnings.push(
              `Lessons sheet row ${index + 2}: Timeslot with ID ${timeslotId} not found. Lesson will be unpinned from timeslot.`
            );
          }
        }

        // Look up room by ID if provided
        let roomRef: number | null = null;
        if (this.hasValue(row.roomId)) {
          const roomId = Number(row.roomId);
          const foundRoom = rooms.find(r => r.id === roomId);
          if (foundRoom) {
            roomRef = foundRoom.id ?? null;
          } else {
            warnings.push(
              `Lessons sheet row ${index + 2}: Room with ID ${roomId} not found. Lesson will be unpinned from room.`
            );
          }
        }

        lessons.push({
          id: Number(row.id),
          subject: String(row.subject),
          teacher,
          studentGroup,
          lessonType,
          year,
          duration: Number(row.duration),
          timeslot: timeslotRef,
          room: roomRef,
          pinned: isPinned,
        });
      } catch (error) {
        errors.push(
          `Lessons sheet row ${index + 2}: ${(error as Error).message}`
        );
      }
    });

    return lessons;
  }

  private extractConfiguration(
    workbook: XLSX.WorkBook,
    warnings: string[]
  ): any {
    const sheetName = 'Configuration';
    const config: any = { constraints: {} };

    if (!workbook.Sheets[sheetName]) {
      warnings.push(
        `Optional sheet '${sheetName}' not found. Using default values.`
      );
      return config;
    }

    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    data.forEach((row: any) => {
      if (this.hasValue(row.setting) && this.hasValue(row.value)) {
        if (row.setting === 'duration') {
          config.duration = Number(row.value);
        } else if (
          row.setting.includes('Conflict') ||
          row.setting.includes('Grouped') ||
          row.setting.includes('After') ||
          row.setting.includes('Building')
        ) {
          // These are constraint configurations
          config.constraints[row.setting] = String(row.value);
        } else {
          config[row.setting] = row.value;
        }
      }
    });

    return config;
  }

  private formatTime(timeValue: any): string {
    if (typeof timeValue === 'string') {
      // Already formatted, ensure it has seconds
      if (timeValue.split(':').length === 2) {
        return timeValue + ':00';
      }
      return timeValue;
    } else if (typeof timeValue === 'number') {
      // Excel time number (fraction of a day)
      const totalMinutes = Math.round(timeValue * 24 * 60);
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      return `${hours.toString().padStart(2, '0')}:${minutes
        .toString()
        .padStart(2, '0')}:00`;
    }
    return String(timeValue);
  }

  private parsePreferredTimeslots(
    timeslotsString: any,
    rowNumber: number,
    errors: string[]
  ): TeacherTimeslot[] {
    if (!this.hasValue(timeslotsString)) {
      return [];
    }

    const timeslots: TeacherTimeslot[] = [];
    const timeslotStrings = String(timeslotsString).split('|');

    timeslotStrings.forEach((timeslotStr: string, index: number) => {
      const trimmed = timeslotStr.trim();
      if (!trimmed) return;

      try {
        // Expected format: DAY/START_TIME-END_TIME
        // Example: MONDAY/08:00-12:00
        const parts = trimmed.split('/');
        if (parts.length !== 2) {
          errors.push(
            `Teachers sheet row ${rowNumber}, timeslot ${
              index + 1
            }: Invalid format '${trimmed}'. Expected format: DAY/START_TIME-END_TIME`
          );
          return;
        }

        const dayOfWeek = parts[0].trim().toUpperCase();
        const timeParts = parts[1].split('-');

        if (timeParts.length !== 2) {
          errors.push(
            `Teachers sheet row ${rowNumber}, timeslot ${
              index + 1
            }: Invalid time format '${
              parts[1]
            }'. Expected format: START_TIME-END_TIME`
          );
          return;
        }

        const startTime = this.normalizeTime(timeParts[0].trim());
        const endTime = this.normalizeTime(timeParts[1].trim());

        // Validate day of week
        const validDays = [
          'MONDAY',
          'TUESDAY',
          'WEDNESDAY',
          'THURSDAY',
          'FRIDAY',
          'SATURDAY',
          'SUNDAY',
        ];
        if (!validDays.includes(dayOfWeek)) {
          errors.push(
            `Teachers sheet row ${rowNumber}, timeslot ${
              index + 1
            }: Invalid day '${dayOfWeek}'. Must be one of: ${validDays.join(
              ', '
            )}`
          );
          return;
        }

        // Validate time format
        if (
          !this.isValidTimeFormat(startTime) ||
          !this.isValidTimeFormat(endTime)
        ) {
          errors.push(
            `Teachers sheet row ${rowNumber}, timeslot ${
              index + 1
            }: Invalid time format. Use HH:MM format (e.g., 08:00, 14:30)`
          );
          return;
        }

        timeslots.push({
          dayOfWeek: dayOfWeek,
          startTime: startTime,
          endTime: endTime,
        });
      } catch (error) {
        errors.push(
          `Teachers sheet row ${rowNumber}, timeslot ${index + 1}: ${
            (error as Error).message
          }`
        );
      }
    });

    return timeslots;
  }

  private normalizeTime(time: string): string {
    // Handle different time formats and normalize to HH:MM:SS
    time = time.trim();

    // If already in HH:MM:SS format, return as is
    if (/^\d{2}:\d{2}:\d{2}$/.test(time)) {
      return time;
    }

    // If in HH:MM format, add seconds
    if (/^\d{1,2}:\d{2}$/.test(time)) {
      const parts = time.split(':');
      const hours = parts[0].padStart(2, '0');
      const minutes = parts[1];
      return `${hours}:${minutes}:00`;
    }

    // If in H:MM format, pad hours
    if (/^\d:\d{2}$/.test(time)) {
      return `0${time}:00`;
    }

    return time;
  }

  private isValidTimeFormat(time: string): boolean {
    // Check if time is in HH:MM:SS format and is valid
    const timeRegex = /^([0-1]?\d|2[0-3]):([0-5]?\d):([0-5]?\d)$/;
    if (!timeRegex.test(time)) {
      return false;
    }

    const parts = time.split(':');
    const hours = parseInt(parts[0]);
    const minutes = parseInt(parts[1]);
    const seconds = parseInt(parts[2]);

    return (
      hours >= 0 &&
      hours <= 23 &&
      minutes >= 0 &&
      minutes <= 59 &&
      seconds >= 0 &&
      seconds <= 59
    );
  }

  // Helper method to check if a value exists and is not empty
  private hasValue(value: any): boolean {
    return (
      value !== undefined &&
      value !== null &&
      (value !== '' || String(value).trim() !== '')
    );
  }
}
