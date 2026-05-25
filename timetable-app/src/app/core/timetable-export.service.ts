import { Injectable } from '@angular/core';
import { Lesson, Room, Timetable, Timeslot } from '../model/timetableEntities';
import * as XLSX from 'xlsx';

interface LessonRow {
  [key: string]: string | number;
}

@Injectable({ providedIn: 'root' })
export class TimetableExportService {

  private readonly DAY_ORDER: Record<string, number> = {
    MONDAY: 1, TUESDAY: 2, WEDNESDAY: 3, THURSDAY: 4,
    FRIDAY: 5, SATURDAY: 6, SUNDAY: 7,
  };

  private readonly DAY_LABELS: Record<string, string> = {
    MONDAY: 'Monday', TUESDAY: 'Tuesday', WEDNESDAY: 'Wednesday',
    THURSDAY: 'Thursday', FRIDAY: 'Friday', SATURDAY: 'Saturday',
    SUNDAY: 'Sunday',
  };

  // ──────────────────────────────────────────────
  // Public API
  // ──────────────────────────────────────────────

  /**
   * Existing flat export: JSON file + single-sheet Excel.
   */
  exportFullTimetable(timetableData: Timetable, userEmail: string): void {
    if (!timetableData?.lessons?.length) {
      throw new Error('No timetable data available to export.');
    }

    const fileName = this.generateFileName('timetable-export');

    // JSON export
    const exportData = {
      exportInfo: {
        exportDate: new Date().toISOString(),
        exportedBy: userEmail,
        totalLessons: timetableData.lessons.length,
        totalRooms: timetableData.rooms?.length || 0,
        totalTimeslots: timetableData.timeslots?.length || 0,
      },
      timetableData,
    };
    this.downloadJSON(exportData, fileName);

    // Excel export — flat list
    const rows = this.buildFlatRows(timetableData);
    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = [
      { wch: 20 }, { wch: 15 }, { wch: 20 }, { wch: 15 },
      { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 },
      { wch: 15 }, { wch: 15 }, { wch: 8 }, { wch: 10 },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Timetable');
    XLSX.writeFile(wb, `${fileName}.xlsx`);
  }

  /**
   * Student Groups grouped by Year.
   * Columns match process_timetable.py:
   *   Subject, Lesson Type, Teacher, Student Group, Day, Start Time, End Time, Room
   */
  exportByStudentGroup(timetableData: Timetable): void {
    this.validateData(timetableData);

    const lessons = timetableData.lessons!;
    const timeslotMap = this.buildTimeslotMap(timetableData);
    const roomMap = this.buildRoomMap(timetableData);

    // Group lessons by Year
    const byYear = new Map<string, Lesson[]>();
    for (const lesson of lessons) {
      const year = lesson.year || lesson.studentGroup?.year || 'UNKNOWN';
      const key = String(year);
      if (!byYear.has(key)) byYear.set(key, []);
      byYear.get(key)!.push(lesson);
    }

    const wb = XLSX.utils.book_new();

    // Summary sheet
    this.addSummarySheet(wb, 'Student Groups by Year', byYear, (yearLessons) => {
      const groups = new Set(yearLessons.map(l => l.studentGroup?.studentGroup || 'N/A'));
      return groups.size;
    });

    // One sheet per Year
    const sortedYears = this.sortYearKeys([...byYear.keys()]);
    for (const year of sortedYears) {
      const yearLessons = byYear.get(year)!;

      // Sub-group by studentGroup name within this year
      const byGroup = this.groupBy(yearLessons, l => l.studentGroup?.studentGroup || 'N/A');
      const sortedGroups = [...byGroup.keys()].sort();

      const columns = ['Subject', 'Lesson Type', 'Teacher', 'Student Group', 'Day', 'Start Time', 'End Time', 'Room'];
      const sheetRows: LessonRow[] = [];
      for (const groupName of sortedGroups) {
        const groupLessons = byGroup.get(groupName)!;

        // Separator row
        sheetRows.push(this.separatorRow(
          `▸ ${groupName} (${groupLessons.length} lessons)`,
          columns,
        ));

        // Sorted lessons
        const sorted = this.sortLessons(groupLessons, timeslotMap);
        for (const lesson of sorted) {
          const ts = timeslotMap.get(lesson.timeslot);
          const room = roomMap.get(lesson.room);
          sheetRows.push({
            'Subject': lesson.subject || '',
            'Lesson Type': lesson.lessonType || '',
            'Teacher': lesson.teacher?.name || 'N/A',
            'Student Group': lesson.studentGroup?.studentGroup || 'N/A',
            'Day': this.formatDay(ts?.dayOfWeek),
            'Start Time': ts?.startTime || 'N/A',
            'End Time': ts?.endTime || 'N/A',
            'Room': room?.name || 'N/A',
          });
        }

        // Empty row after group
        sheetRows.push(this.emptyRow(columns));
      }

      const ws = XLSX.utils.json_to_sheet(sheetRows);
      this.applySheetFormatting(ws, columns.length, sheetRows.length, [
        20, 15, 20, 15, 12, 12, 12, 15,
      ]);

      const sheetName = this.sanitizeSheetName(this.formatYearLabel(year));
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
    }

    XLSX.writeFile(wb, `${this.generateFileName('student-groups-timetable')}.xlsx`);
  }

  /**
   * Teachers grouped by first letter.
   * Columns match displayTeacherTimetable view:
   *   Teacher, Student Group, Subgroup, Subject, Lesson Type, Day, Start Time, End Time, Room, Building
   */
  exportByTeacher(timetableData: Timetable): void {
    this.validateData(timetableData);

    const lessons = timetableData.lessons!;
    const timeslotMap = this.buildTimeslotMap(timetableData);
    const roomMap = this.buildRoomMap(timetableData);

    // Group lessons by teacher first letter
    const byLetter = new Map<string, Lesson[]>();
    for (const lesson of lessons) {
      const name = lesson.teacher?.name || 'Unknown';
      const letter = name.charAt(0).toUpperCase();
      const key = /[A-Z]/.test(letter) ? letter : '#';
      if (!byLetter.has(key)) byLetter.set(key, []);
      byLetter.get(key)!.push(lesson);
    }

    const wb = XLSX.utils.book_new();

    // Summary sheet
    this.addSummarySheet(wb, 'Teachers by Letter', byLetter, (letterLessons) => {
      const teachers = new Set(letterLessons.map(l => l.teacher?.name || 'Unknown'));
      return teachers.size;
    });

    // One sheet per letter
    const sortedLetters = [...byLetter.keys()].sort();
    for (const letter of sortedLetters) {
      const letterLessons = byLetter.get(letter)!;

      // Sub-group by teacher name
      const byTeacher = this.groupBy(letterLessons, l => l.teacher?.name || 'Unknown');
      const sortedTeachers = [...byTeacher.keys()].sort();

      const columns = ['Teacher', 'Student Group', 'Subgroup', 'Subject', 'Lesson Type', 'Day', 'Start Time', 'End Time', 'Room', 'Building'];
      const sheetRows: LessonRow[] = [];
      for (const teacherName of sortedTeachers) {
        const teacherLessons = byTeacher.get(teacherName)!;

        // Separator row
        sheetRows.push(this.separatorRow(
          `▸ ${teacherName} (${teacherLessons.length} lessons)`,
          columns,
        ));

        const sorted = this.sortLessons(teacherLessons, timeslotMap);
        for (const lesson of sorted) {
          const ts = timeslotMap.get(lesson.timeslot);
          const room = roomMap.get(lesson.room);
          sheetRows.push({
            'Teacher': lesson.teacher?.name || 'N/A',
            'Student Group': lesson.studentGroup?.studentGroup || 'N/A',
            'Subgroup': lesson.studentGroup?.semiGroup?.replace('SEMI_GROUP', 'Subgroup ') || 'N/A',
            'Subject': lesson.subject || '',
            'Lesson Type': lesson.lessonType || '',
            'Day': this.formatDay(ts?.dayOfWeek),
            'Start Time': ts?.startTime || 'N/A',
            'End Time': ts?.endTime || 'N/A',
            'Room': room?.name || 'N/A',
            'Building': room?.building || 'N/A',
          });
        }

        sheetRows.push(this.emptyRow(columns));
      }

      const ws = XLSX.utils.json_to_sheet(sheetRows);
      this.applySheetFormatting(ws, columns.length, sheetRows.length, [
        20, 15, 12, 20, 15, 12, 12, 12, 15, 15,
      ]);

      XLSX.utils.book_append_sheet(wb, ws, this.sanitizeSheetName(`Teachers ${letter}`));
    }

    XLSX.writeFile(wb, `${this.generateFileName('teachers-timetable')}.xlsx`);
  }

  /**
   * Rooms grouped by Building.
   * Columns match displayRoomTimetable view:
   *   Room, Building, Day, Start Time, End Time, Student Group, Subgroup, Subject, Lesson Type, Teacher
   */
  exportByRoom(timetableData: Timetable): void {
    this.validateData(timetableData);

    const lessons = timetableData.lessons!;
    const timeslotMap = this.buildTimeslotMap(timetableData);
    const roomMap = this.buildRoomMap(timetableData);

    // Group lessons by building
    const byBuilding = new Map<string, Lesson[]>();
    for (const lesson of lessons) {
      const room = roomMap.get(lesson.room);
      const building = room?.building || 'Unknown';
      if (!byBuilding.has(building)) byBuilding.set(building, []);
      byBuilding.get(building)!.push(lesson);
    }

    const wb = XLSX.utils.book_new();

    // Summary sheet
    this.addSummarySheet(wb, 'Rooms by Building', byBuilding, (buildingLessons) => {
      const rooms = new Set(buildingLessons.map(l => {
        const r = roomMap.get(l.room);
        return r?.name || 'N/A';
      }));
      return rooms.size;
    });

    // One sheet per building
    const sortedBuildings = [...byBuilding.keys()].sort();
    for (const building of sortedBuildings) {
      const buildingLessons = byBuilding.get(building)!;

      // Sub-group by room name
      const byRoom = this.groupBy(buildingLessons, l => {
        const r = roomMap.get(l.room);
        return r?.name || 'N/A';
      });
      const sortedRooms = [...byRoom.keys()].sort();

      const columns = ['Room', 'Building', 'Day', 'Start Time', 'End Time', 'Student Group', 'Subgroup', 'Subject', 'Lesson Type', 'Teacher'];
      const sheetRows: LessonRow[] = [];
      for (const roomName of sortedRooms) {
        const roomLessons = byRoom.get(roomName)!;

        // Separator row
        sheetRows.push(this.separatorRow(
          `▸ ${roomName} (${roomLessons.length} lessons)`,
          columns,
        ));

        const sorted = this.sortLessons(roomLessons, timeslotMap);
        for (const lesson of sorted) {
          const ts = timeslotMap.get(lesson.timeslot);
          const room = roomMap.get(lesson.room);
          sheetRows.push({
            'Room': room?.name || 'N/A',
            'Building': room?.building || 'N/A',
            'Day': this.formatDay(ts?.dayOfWeek),
            'Start Time': ts?.startTime || 'N/A',
            'End Time': ts?.endTime || 'N/A',
            'Student Group': lesson.studentGroup?.studentGroup || 'N/A',
            'Subgroup': lesson.studentGroup?.semiGroup?.replace('SEMI_GROUP', 'Subgroup ') || 'N/A',
            'Subject': lesson.subject || '',
            'Lesson Type': lesson.lessonType || '',
            'Teacher': lesson.teacher?.name || 'N/A',
          });
        }

        sheetRows.push(this.emptyRow(columns));
      }

      const ws = XLSX.utils.json_to_sheet(sheetRows);
      this.applySheetFormatting(ws, columns.length, sheetRows.length, [
        15, 15, 12, 12, 12, 15, 12, 20, 15, 20,
      ]);

      XLSX.utils.book_append_sheet(wb, ws, this.sanitizeSheetName(building));
    }

    XLSX.writeFile(wb, `${this.generateFileName('rooms-timetable')}.xlsx`);
  }

  /**
   * Structured JSON export organized by entity type.
   */
  exportStructuredJSON(timetableData: Timetable, userEmail: string): void {
    this.validateData(timetableData);

    const timeslotMap = this.buildTimeslotMap(timetableData);
    const roomMap = this.buildRoomMap(timetableData);
    const lessons = timetableData.lessons!;

    // Build student group structure
    const studentGroups: Record<string, Record<string, any[]>> = {};
    const teachers: Record<string, any[]> = {};
    const rooms: Record<string, Record<string, any[]>> = {};

    for (const lesson of lessons) {
      const ts = timeslotMap.get(lesson.timeslot);
      const room = roomMap.get(lesson.room);

      const resolved = {
        subject: lesson.subject,
        lessonType: lesson.lessonType,
        teacher: lesson.teacher?.name || 'N/A',
        studentGroup: lesson.studentGroup?.studentGroup || 'N/A',
        subgroup: lesson.studentGroup?.semiGroup || 'N/A',
        day: this.formatDay(ts?.dayOfWeek),
        startTime: ts?.startTime || 'N/A',
        endTime: ts?.endTime || 'N/A',
        room: room?.name || 'N/A',
        building: room?.building || 'N/A',
      };

      // By student group
      const year = String(lesson.year || lesson.studentGroup?.year || 'UNKNOWN');
      const groupName = lesson.studentGroup?.studentGroup || 'N/A';
      if (!studentGroups[year]) studentGroups[year] = {};
      if (!studentGroups[year][groupName]) studentGroups[year][groupName] = [];
      studentGroups[year][groupName].push(resolved);

      // By teacher
      const teacherName = lesson.teacher?.name || 'Unknown';
      if (!teachers[teacherName]) teachers[teacherName] = [];
      teachers[teacherName].push(resolved);

      // By room
      const buildingName = room?.building || 'Unknown';
      const roomName = room?.name || 'N/A';
      if (!rooms[buildingName]) rooms[buildingName] = {};
      if (!rooms[buildingName][roomName]) rooms[buildingName][roomName] = [];
      rooms[buildingName][roomName].push(resolved);
    }

    const exportData = {
      exportInfo: {
        exportDate: new Date().toISOString(),
        exportedBy: userEmail,
        totalLessons: lessons.length,
        totalRooms: timetableData.rooms?.length || 0,
        totalTimeslots: timetableData.timeslots?.length || 0,
      },
      studentGroups,
      teachers,
      rooms,
      rawTimetableData: timetableData,
    };

    this.downloadJSON(exportData, this.generateFileName('timetable-structured'));
  }

  // ──────────────────────────────────────────────
  // Private helpers
  // ──────────────────────────────────────────────

  private validateData(timetableData: Timetable): void {
    if (!timetableData?.lessons?.length) {
      throw new Error('No timetable data available to export.');
    }
  }

  private generateFileName(prefix: string): string {
    const d = new Date();
    return `${prefix}-${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}_${d.getHours()}-${d.getMinutes()}`;
  }

  private formatDay(day: string | undefined): string {
    if (!day) return 'N/A';
    return this.DAY_LABELS[day] || day;
  }

  private sanitizeSheetName(name: string): string {
    // Excel sheet names: max 31 chars, no [ ] * ? / \
    return name.replace(/[[\]*?/\\]/g, '').substring(0, 31);
  }

  private buildTimeslotMap(timetable: Timetable): Map<any, Timeslot> {
    return new Map((timetable.timeslots || []).map(s => [s.id, s]));
  }

  private buildRoomMap(timetable: Timetable): Map<any, Room> {
    return new Map((timetable.rooms || []).map(r => [r.id, r]));
  }

  private groupBy<T>(items: T[], keyFn: (item: T) => string): Map<string, T[]> {
    const map = new Map<string, T[]>();
    for (const item of items) {
      const key = keyFn(item);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(item);
    }
    return map;
  }

  private sortLessons(lessons: Lesson[], timeslotMap: Map<any, Timeslot>): Lesson[] {
    return [...lessons].sort((a, b) => {
      const tsA = timeslotMap.get(a.timeslot);
      const tsB = timeslotMap.get(b.timeslot);
      if (!tsA || !tsB) return 0;

      const dayA = this.DAY_ORDER[tsA.dayOfWeek as string] ?? 99;
      const dayB = this.DAY_ORDER[tsB.dayOfWeek as string] ?? 99;
      if (dayA !== dayB) return dayA - dayB;

      return (tsA.startTime ?? '').localeCompare(tsB.startTime ?? '');
    });
  }

  private separatorRow(label: string, columns: string[]): LessonRow {
    const row: LessonRow = {};
    for (let i = 0; i < columns.length; i++) {
      row[columns[i]] = i === 0 ? label : '';
    }
    return row;
  }

  private emptyRow(columns: string[]): LessonRow {
    return this.separatorRow('', columns);
  }

  private formatYearLabel(year: string): string {
    const yearLabels: Record<string, string> = {
      FIRST: 'Year I', SECOND: 'Year II', THIRD: 'Year III',
      FOURTH: 'Year IV', FIFTH: 'Year V', SIXTH: 'Year VI',
      SEVENTH: 'Year VII', EIGHTH: 'Year VIII', NINTH: 'Year IX',
      TENTH: 'Year X', ELEVENTH: 'Year XI', TWELVETH: 'Year XII',
      PREPARATORY: 'Preparatory', SMALL_GROUP: 'Small Group',
      MIDDLE_GROUP: 'Middle Group', SENIOR_GROUP: 'Senior Group',
    };
    return yearLabels[year] || year;
  }

  private sortYearKeys(keys: string[]): string[] {
    const order = [
      'PREPARATORY', 'SMALL_GROUP', 'MIDDLE_GROUP', 'SENIOR_GROUP',
      'FIRST', 'SECOND', 'THIRD', 'FOURTH', 'FIFTH', 'SIXTH',
      'SEVENTH', 'EIGHTH', 'NINTH', 'TENTH', 'ELEVENTH', 'TWELVETH',
    ];
    return keys.sort((a, b) => {
      const ia = order.indexOf(a);
      const ib = order.indexOf(b);
      return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
    });
  }

  private applySheetFormatting(
    ws: XLSX.WorkSheet,
    columnCount: number,
    rowCount: number,
    widths: number[],
  ): void {
    // Column widths
    ws['!cols'] = widths.map(w => ({ wch: w }));

    // AutoFilter on header row
    const lastCol = XLSX.utils.encode_col(columnCount - 1);
    ws['!autofilter'] = { ref: `A1:${lastCol}1` };
  }

  private addSummarySheet(
    wb: XLSX.WorkBook,
    title: string,
    groupMap: Map<string, Lesson[]>,
    entityCountFn: (lessons: Lesson[]) => number,
  ): void {
    const summaryRows: LessonRow[] = [];

    summaryRows.push({ 'Category': `=== ${title} ===`, 'Entities': '', 'Lessons': '' });
    summaryRows.push({ 'Category': `Export Date: ${new Date().toLocaleString()}`, 'Entities': '', 'Lessons': '' });
    summaryRows.push({ 'Category': '', 'Entities': '', 'Lessons': '' });
    summaryRows.push({ 'Category': 'Category', 'Entities': 'Entities', 'Lessons': 'Lessons' });

    let totalEntities = 0;
    let totalLessons = 0;

    const sortedKeys = [...groupMap.keys()].sort();
    for (const key of sortedKeys) {
      const lessons = groupMap.get(key)!;
      const entities = entityCountFn(lessons);
      totalEntities += entities;
      totalLessons += lessons.length;

      const label = title.includes('Year') ? this.formatYearLabel(key) : key;
      summaryRows.push({
        'Category': label,
        'Entities': entities,
        'Lessons': lessons.length,
      });
    }

    summaryRows.push({ 'Category': '', 'Entities': '', 'Lessons': '' });
    summaryRows.push({
      'Category': 'TOTAL',
      'Entities': totalEntities,
      'Lessons': totalLessons,
    });

    const ws = XLSX.utils.json_to_sheet(summaryRows);
    ws['!cols'] = [{ wch: 25 }, { wch: 12 }, { wch: 12 }];
    XLSX.utils.book_append_sheet(wb, ws, 'Summary');
  }

  private buildFlatRows(timetableData: Timetable): LessonRow[] {
    const timeslotMap = this.buildTimeslotMap(timetableData);
    const roomMap = this.buildRoomMap(timetableData);

    return (timetableData.lessons || []).map(lesson => {
      const ts = timeslotMap.get(lesson.timeslot);
      const room = roomMap.get(lesson.room);
      return {
        'Subject': lesson.subject || '',
        'Lesson Type': lesson.lessonType || '',
        'Teacher': lesson.teacher?.name || 'N/A',
        'Student Group': lesson.studentGroup?.studentGroup || 'N/A',
        'Subgroup': lesson.studentGroup?.semiGroup?.replace('SEMI_GROUP', 'Subgroup ') || 'N/A',
        'Day': this.formatDay(ts?.dayOfWeek),
        'Start Time': ts?.startTime || 'N/A',
        'End Time': ts?.endTime || 'N/A',
        'Room': room?.name || 'N/A',
        'Building': room?.building || 'N/A',
        'Pinned': lesson.pinned ? 'Yes' : 'No',
        'Rules': lesson.appliedRuleIds?.length ? `${lesson.appliedRuleIds.length} rule(s)` : '-',
      };
    });
  }

  private downloadJSON(data: any, fileName: string): void {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }
}
