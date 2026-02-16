import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { Timetable, Lesson, RestrictionRule, RuleTargetType, RuleOperator, RuleCombination } from '../model/timetableEntities';

@Injectable({
  providedIn: 'root'
})
export class ExcelExportService {

  constructor() { }

  exportTimetable(data: Timetable, fileName: string = 'timetable_export'): void {
    const workbook = XLSX.utils.book_new();

    // 1. Timeslots
    if (data.timeslots && data.timeslots.length > 0) {
      const timeslotData = data.timeslots.map(ts => ({
        Day: ts.dayOfWeek,
        Start: ts.startTime,
        End: ts.endTime
      }));
      const timeslotSheet = XLSX.utils.json_to_sheet(timeslotData);
      XLSX.utils.book_append_sheet(workbook, timeslotSheet, 'Timeslots');
    }

    // 2. Rooms
    if (data.rooms && data.rooms.length > 0) {
      const roomData = data.rooms.map(r => ({
        Name: r.name,
        Capacity: r.capacity,
        Building: r.building
      }));
      const roomSheet = XLSX.utils.json_to_sheet(roomData);
      XLSX.utils.book_append_sheet(workbook, roomSheet, 'Rooms');
    }

    // 3. Teachers
    if (data.lessons && data.lessons.length > 0) {
      // Extract unique teachers from lessons since we might not have a separate teacher list
      const teachers = new Map<string, any>();
      data.lessons.forEach(l => {
        if (l.teacher && l.teacher.name) {
          teachers.set(l.teacher.name, { Name: l.teacher.name });
        }
      });
      const teacherData = Array.from(teachers.values());
      if (teacherData.length > 0) {
        const teacherSheet = XLSX.utils.json_to_sheet(teacherData);
        XLSX.utils.book_append_sheet(workbook, teacherSheet, 'Teachers');
      }
    }

    // 4. Student Groups
     if (data.lessons && data.lessons.length > 0) {
      // Extract unique groups
      const groups = new Map<string, any>();
      data.lessons.forEach(l => {
        if (l.studentGroup && l.studentGroup.name) {
          groups.set(l.studentGroup.name, {
            Name: l.studentGroup.name,
            Size: l.studentGroup.numberOfStudents,
            Year: l.studentGroup.year,
            Semigroup: l.studentGroup.semiGroup
          });
        }
      });
      const groupData = Array.from(groups.values());
      if (groupData.length > 0) {
        const groupSheet = XLSX.utils.json_to_sheet(groupData);
        XLSX.utils.book_append_sheet(workbook, groupSheet, 'StudentGroups');
      }
    }

    // 5. Restriction Rules
    if (data.restrictionRules && data.restrictionRules.length > 0) {
      const ruleData = data.restrictionRules.map(r => {
        // Format specific items
        let specificItems = '';
        if (r.targetType === RuleTargetType.ROOM && r.specificRooms) {
          specificItems = r.specificRooms.map(room => room.name).join(',');
        } else if (r.targetType === RuleTargetType.TIMESLOT && r.specificTimeslots) {
             // For timeslots we might need a simpler representation or ID, but for now let's try a readable format if possible
             // or just indices. The import service usually expects IDs or something matching.
             // Let's assume specificItems for timeslots might be complex to export perfectly readable without IDs.
             // If we use IDs in import, we should export IDs.
             // But usually Excel import relies on content.
             // Let's skip complex timeslot specific items for now or format as "Day Start-End" if the parsed supports it.
             // For safety, let's map to a string representation that the import might parse or just empty if complex.
             specificItems = r.specificTimeslots.map(ts => `${ts.dayOfWeek} ${ts.startTime}-${ts.endTime}`).join(',');
        }

        return {
          Name: r.name,
          TargetType: r.targetType,
          Mode: (r.criteriaField || r.operator) ? 'CRITERIA' : 'SPECIFIC',
          Field: r.criteriaField,
          Operator: r.operator,
          Value: r.criteriaValue,
          SpecificItems: specificItems
        };
      });
      const ruleSheet = XLSX.utils.json_to_sheet(ruleData);
      XLSX.utils.book_append_sheet(workbook, ruleSheet, 'RestrictionRules');
    }

    // 6. Lessons
    if (data.lessons && data.lessons.length > 0) {
      const lessonData = data.lessons.map(l => {
        // Get rule names
        const ruleNames = l.restrictionRules ? l.restrictionRules.map(r => r.name).join(',') : '';

        return {
          Subject: l.subject,
          Teacher: l.teacher.name,
          StudentGroup: l.studentGroup.name,
          Type: l.lessonType,
          // Duration: l.duration, // Often standard 1, only export if needed
          Rules: ruleNames,
          RoomRuleCombination: l.roomRuleCombination,
          TimeslotRuleCombination: l.timeslotRuleCombination
        };
      });
      const lessonSheet = XLSX.utils.json_to_sheet(lessonData);
      XLSX.utils.book_append_sheet(workbook, lessonSheet, 'Lessons');
    }

    // Write file
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  }
}
