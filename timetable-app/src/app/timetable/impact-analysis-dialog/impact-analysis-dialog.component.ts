import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Lesson, Room, Timeslot, HardMediumSoftScore } from '../../model/timetableEntities';

export interface LessonChangeInfo {
  lesson: Lesson;
  originalRoom: Room | undefined;
  originalTimeslot: Timeslot | undefined;
  newRoom: Room | undefined;
  newTimeslot: Timeslot | undefined;
}

export interface ConstraintViolation {
  constraintName: string;
  constraintType: 'hard' | 'medium' | 'soft';
  description: string;
  affectedLessons: Lesson[];
  score: string;
}

export interface ImpactAnalysisDialogData {
  change: LessonChangeInfo;
  previousScore: HardMediumSoftScore | null;
  newScore: HardMediumSoftScore | null;
  violations: ConstraintViolation[];
  analysisData: any;
  rooms: Room[];
  timeslots: Timeslot[];
  isModified: boolean;
}

/** Constraints to exclude from lesson-level analysis (aggregate distribution metrics). */
const EXCLUDED_CONSTRAINTS = new Set(['fairLessonsDistribution']);

@Component({
  selector: 'app-impact-analysis-dialog',
  templateUrl: './impact-analysis-dialog.component.html',
  styleUrls: ['./impact-analysis-dialog.component.css'],
})
export class ImpactAnalysisDialogComponent implements OnInit {
  displayedViolations: ConstraintViolation[] = [];
  violationSummary = {
    hard: 0,
    medium: 0,
    soft: 0,
  };
  /** Per-lesson score contribution across all matching constraints. */
  lessonScoreBreakdown = { hard: 0, medium: 0, soft: 0 };

  // Lookup maps for resolving ID references
  private roomMap: Map<number, Room> = new Map();
  private timeslotMap: Map<number, Timeslot> = new Map();

  constructor(
    public dialogRef: MatDialogRef<ImpactAnalysisDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ImpactAnalysisDialogData
  ) {}

  ngOnInit(): void {
    this.buildLookupMaps();
    this.processViolations();
  }

  private buildLookupMaps(): void {
    // Build room lookup map
    if (this.data.rooms) {
      this.data.rooms.forEach(room => {
        if (room.id !== undefined) {
          this.roomMap.set(room.id, room);
        }
      });
    }
    // Build timeslot lookup map
    if (this.data.timeslots) {
      this.data.timeslots.forEach(ts => {
        if (ts.id !== undefined) {
          this.timeslotMap.set(ts.id, ts);
        }
      });
    }
  }

  /**
   * Resolve room and timeslot ID references to full objects
   */
  private resolveLesson(lesson: any): Lesson {
    const resolvedLesson = { ...lesson };
    
    // Resolve room if it's just an ID
    if (typeof lesson.room === 'number') {
      resolvedLesson.room = this.roomMap.get(lesson.room) || lesson.room;
    }
    
    // Resolve timeslot if it's just an ID
    if (typeof lesson.timeslot === 'number') {
      resolvedLesson.timeslot = this.timeslotMap.get(lesson.timeslot) || lesson.timeslot;
    }
    
    return resolvedLesson;
  }

  /**
   * Determines whether a constraint match is relevant to the analyzed lesson.
   * Handles all justification shapes:
   *  - Pair-based: lesson1/lesson2 (roomConflict, teacherConflict, etc.)
   *  - Single-lesson: lesson (maximizePreferredTimeslotAssignments, capacityRoomConflict)
   *  - Conflicting-lessons list: studentGroup (string) + conflictingLessons (studentGroupConflictAdvanced)
   *  - StudentGroup aggregate: studentGroup (object) + dayOfWeek (earlyStartForHighschool, noGapsForHighschool)
   *  - TeacherDay aggregate: teacherDay (maximmumCoursesTeached)
   *  - StudentDay aggregate: studentDay (maximumCoursesForStudents)
   *  - Group-timeslot grouping: groupName (coursesGroupedInTheSameTimeslot, etc.)
   *  - Room-capacity grouping: series + timeslotId (labsStudentsGroupedInTheSameRoom, etc.)
   */
  private isMatchRelevant(justification: any, lesson: Lesson): boolean {
    if (!justification) return false;

    const lessonId = lesson.id;
    const studentGroupId = lesson.studentGroup?.id;
    const teacherId = lesson.teacher?.id;
    const studentGroupName = lesson.studentGroup?.name;
    const studentGroup = lesson.studentGroup?.studentGroup;

    // 1. Pair-based: lesson1/lesson2
    if (justification.lesson1 || justification.lesson2) {
      return justification.lesson1?.id === lessonId || justification.lesson2?.id === lessonId;
    }

    // 2. Single-lesson: lesson
    if (justification.lesson) {
      return justification.lesson.id === lessonId;
    }

    // 3. Conflicting-lessons list (studentGroupConflictAdvanced)
    //    studentGroup is a string name, conflictingLessons is an array of lessons
    if (justification.conflictingLessons && Array.isArray(justification.conflictingLessons)) {
      return justification.conflictingLessons.some((l: any) => l.id === lessonId);
    }

    // 4. StudentGroup-day aggregate (earlyStartForHighschool, noGapsForHighschool)
    //    studentGroup is an object with .id
    if (justification.studentGroup && justification.dayOfWeek) {
      return justification.studentGroup.id === studentGroupId;
    }

    // 5. Teacher-day aggregate (maximmumCoursesTeached)
    if (justification.teacherDay) {
      return justification.teacherDay.teacher?.id === teacherId;
    }

    // 6. StudentDay aggregate (maximumCoursesForStudents)
    if (justification.studentDay) {
      return justification.studentDay.studentGroup?.id === studentGroupId;
    }

    // 7. Group-timeslot grouping (coursesGroupedInTheSameTimeslot, seminars, labs)
    if (justification.groupName && justification.subject !== undefined) {
      return justification.groupName === studentGroupName || justification.groupName === studentGroup;
    }

    // 8. Room-capacity grouping (labsStudentsGroupedInTheSameRoom, course, seminar)
    if (justification.series && justification.timeslotId !== undefined) {
      const matchesSeries = justification.series === studentGroupName || justification.series === studentGroup;
      const matchesTimeslot = justification.timeslotId === lesson.timeslot;
      return matchesSeries && matchesTimeslot;
    }

    return false;
  }

  private getScoreComponents(score: any) {
    const components = { hard: 0, medium: 0, soft: 0 };
    if (typeof score === 'string') {
      Array.from(score.matchAll(/(-?[0-9]+)(hard|medium|soft)/g)).forEach(
        (m: any) => {
          components[m[2] as 'hard' | 'medium' | 'soft'] = parseInt(m[1], 10);
        }
      );
    } else if (score && typeof score === 'object') {
      components.hard = score.hardScore ?? 0;
      components.medium = score.mediumScore ?? 0;
      components.soft = score.softScore ?? 0;
    }
    return components;
  }

  private processViolations(): void {
    if (!this.data.analysisData?.constraints) {
      this.displayedViolations = [];
      return;
    }

    let constraintsArray: any[] = [];
    const rawConstraints = this.data.analysisData.constraints;
    if (Array.isArray(rawConstraints)) {
      constraintsArray = [...rawConstraints];
    } else if (rawConstraints && typeof rawConstraints === 'object') {
      for (const [key, value] of Object.entries(rawConstraints)) {
        const val = value as any;
        let id = val.constraintRef?.id || key.replace(/^ConstraintRef\[id=/, '').replace(/\]$/, '');
        if (id.includes('/')) {
            id = id.split('/').pop();
        }
        constraintsArray.push({
          name: id,
          weight: val.weight,
          score: val.score,
          matches: val.matches || [],
          matchCount: val.matchCount || 0
        });
      }
    }

    const lesson = this.data.change.lesson;
    const lessonId = lesson.id;
    const relevantViolations: ConstraintViolation[] = [];
    const scoreAccum = { hard: 0, medium: 0, soft: 0 };

    for (const constraint of constraintsArray) {
      // Normalize array-based constraints
      if (!constraint.name) {
          constraint.name = constraint.id || constraint.constraintName || constraint.constraintId || 'N/A';
          if (typeof constraint.name === 'string' && constraint.name.includes('/')) {
              constraint.name = constraint.name.split('/').pop();
          }
      }

      if (!constraint.matches || constraint.matches.length === 0) continue;
      if (EXCLUDED_CONSTRAINTS.has(constraint.name)) continue;

      const relevantMatches = constraint.matches.filter((match: any) =>
        this.isMatchRelevant(match.justification, lesson)
      );

      if (relevantMatches.length > 0) {
        const constraintType = this.getConstraintType(constraint);
        
        for (const match of relevantMatches) {
          // Accumulate per-lesson score contribution
          this.accumulateScore(match.score, scoreAccum);

          const affectedLessons: Lesson[] = [];
          const justification = match.justification;
          
          // Extract affected lessons from pair-based justifications
          if (justification.lesson1 && justification.lesson1.id !== lessonId) {
            affectedLessons.push(this.resolveLesson(justification.lesson1));
          }
          if (justification.lesson2 && justification.lesson2.id !== lessonId) {
            affectedLessons.push(this.resolveLesson(justification.lesson2));
          }

          // Extract affected lessons from conflictingLessons array (studentGroupConflictAdvanced)
          if (Array.isArray(justification.conflictingLessons)) {
            for (const cl of justification.conflictingLessons) {
              if (cl.id !== lessonId) {
                affectedLessons.push(this.resolveLesson(cl));
              }
            }
          }

          const rawDescription = justification.description || '';
          const cleanedDescription = this.cleanDescription(rawDescription, constraint.name, justification);

          relevantViolations.push({
            constraintName: constraint.name,
            constraintType: constraintType,
            description: cleanedDescription || this.generateDescription(constraint.name, match),
            affectedLessons: affectedLessons,
            score: typeof match.score === 'string' ? match.score : 
                   `${match.score?.hardScore || 0}hard/${match.score?.mediumScore || 0}medium/${match.score?.softScore || 0}soft`,
          });
        }
      }
    }

    this.lessonScoreBreakdown = scoreAccum;

    // Update summary counts
    this.violationSummary = { hard: 0, medium: 0, soft: 0 };
    relevantViolations.forEach(v => {
      this.violationSummary[v.constraintType]++;
    });

    // Sort violations by severity
    this.displayedViolations = relevantViolations.sort((a, b) => {
      const order = { hard: 0, medium: 1, soft: 2 };
      return order[a.constraintType] - order[b.constraintType];
    });
  }

  /**
   * Parse a score string like "0hard/-1medium/-5soft" and accumulate into the breakdown.
   */
  private accumulateScore(score: any, accum: { hard: number; medium: number; soft: number }): void {
    if (!score) return;
    const comps = this.getScoreComponents(score);
    accum.hard += comps.hard;
    accum.medium += comps.medium;
    accum.soft += comps.soft;
  }

  /**
   * Determines constraint severity from the constraint's score field.
   * Uses the aggregate score (e.g., "-5hard/0medium/0soft") to identify the level.
   */
  private getConstraintType(constraint: any): 'hard' | 'medium' | 'soft' {
    const score = this.getScoreComponents(constraint.score || constraint.weight);
    if (score.hard !== 0) return 'hard';
    if (score.medium !== 0) return 'medium';
    return 'soft';
  }

  /**
   * Parse and clean up the raw description from the backend.
   * Converts raw object strings into readable text with detailed information.
   * This is generic and works for any constraint type.
   */
  private cleanDescription(rawDescription: string, constraintName: string, justification: any): string {
    if (!rawDescription) return '';

    let cleaned = rawDescription;

    // 1. Extract Teacher name from Teacher(id=X, name=Y) pattern
    cleaned = cleaned.replace(/Teacher\(id=\d+,\s*name=([^,)]+)[^)]*\)/g, '$1');

    // 2. Extract Room details: name, building, capacity
    // Pattern: Room(id=X, name=Y, capacity=Z, building=W)
    cleaned = cleaned.replace(/Room\(id=\d+,\s*name=([^,]+),\s*capacity=(\d+),\s*building=([^)]+)\)/g, 
      (match, name, capacity, building) => {
        return `${name.trim()} - ${building.trim()} (capacity: ${capacity})`;
      }
    );

    // 3. Extract StudentGroup details: year, name, studentGroup, semiGroup
    // Pattern: StudentGroup(id=X, year=Y, name=Z, studentGroup=W, semiGroup=S, numberOfStudents=N)
    cleaned = cleaned.replace(/StudentGroup\(id=\d+,\s*year=([^,]+),\s*name=([^,]+),\s*studentGroup=([^,]+),\s*semiGroup=([^,]+),\s*numberOfStudents=\d+\)/g,
      (match, year, name, group, semiGroup) => {
        const yearFormatted = this.formatYear(year.trim());
        const semiGroupFormatted = this.formatSemiGroup(semiGroup.trim());
        return `${group.trim()} (${yearFormatted} ${name.trim()}, ${semiGroupFormatted})`;
      }
    );

    // 4. Extract Timeslot details: day, startTime-endTime
    // Pattern: Timeslot(id=X, dayOfWeek=DAY, startTime=HH:MM:SS, endTime=HH:MM:SS)
    cleaned = cleaned.replace(/Timeslot\([^)]*dayOfWeek=([^,]+),\s*startTime=([^,]+),\s*endTime=([^)]+)\)/g, 
      (match, day, startTime, endTime) => {
        const formattedDay = this.formatDayShort(day.trim());
        const start = startTime.trim().substring(0, 5);
        const end = endTime.trim().substring(0, 5);
        return `${formattedDay} ${start}-${end}`;
      }
    );

    // 5. Format standalone day references like 'MONDAY 08:30' or 'MONDAY 08:30:00'
    cleaned = cleaned.replace(/'(MONDAY|TUESDAY|WEDNESDAY|THURSDAY|FRIDAY)\s+(\d{2}:\d{2})(:\d{2})?'/g, (match, day, time) => {
      return `${this.formatDayShort(day)} ${time}`;
    });

    // 6. Remove any remaining single quotes around simple values
    cleaned = cleaned.replace(/'([^']+)'/g, '$1');

    return cleaned;
  }

  formatYear(year: string | undefined): string {
    if (!year) return '';
    const yearMap: { [key: string]: string } = {
      'FIRST': '1st Year',
      'SECOND': '2nd Year',
      'THIRD': '3rd Year',
      'FOURTH': '4th Year',
    };
    return yearMap[year] || year;
  }

  formatAffectedTimeslot(timeslot: any): string {
    if (!timeslot) return 'No Time';
    if (typeof timeslot === 'number') return `Timeslot #${timeslot}`;
    const day = this.formatDayShort(timeslot.dayOfWeek);
    const start = timeslot.startTime?.substring(0, 5) || '';
    const end = timeslot.endTime?.substring(0, 5) || '';
    return `${day} ${start}-${end}`;
  }

  private formatSemiGroup(semiGroup: string): string {
    const semiGroupMap: { [key: string]: string } = {
      'SEMI_GROUP0': 'Semi-Group 0',
      'SEMI_GROUP1': 'Semi-Group 1',
      'SEMI_GROUP2': 'Semi-Group 2',
    };
    return semiGroupMap[semiGroup] || semiGroup;
  }

  private formatDayShort(day: string | undefined): string {
    if (!day) return '';
    const dayMap: { [key: string]: string } = {
      'MONDAY': 'Mon',
      'TUESDAY': 'Tue',
      'WEDNESDAY': 'Wed',
      'THURSDAY': 'Thu',
      'FRIDAY': 'Fri',
    };
    return dayMap[day] || day;
  }

  private generateDescription(constraintName: string, match: any): string {
    const justification = match.justification || {};
    const lesson1 = justification.lesson1;
    const lesson2 = justification.lesson2;

    // Generate human-readable descriptions based on constraint type
    const constraintDescriptions: { [key: string]: string } = {
      'roomConflict': `Room conflict: Two lessons are scheduled in the same room at the same time`,
      'teacherConflict': `Teacher conflict: Teacher is assigned to multiple lessons at the same time`,
      'studentGroupConflict': `Student group conflict: Same student group has overlapping lessons`,
      'teacherRoomStability': `Teacher room instability: Teacher has to change rooms during the day`,
      'teacherTimeEfficiency': `Time efficiency: Gap between teacher's lessons`,
      'studentGroupSubjectVariety': `Subject variety: Same subject repeated on same day for student group`,
    };

    // Get base description or generate a generic one
    let description = constraintDescriptions[constraintName] || 
                      this.formatConstraintName(constraintName);

    // Add lesson details if available
    if (lesson1 && lesson2) {
      const lesson1Name = lesson1.subject || 'Unknown';
      const lesson2Name = lesson2.subject || 'Unknown';
      if (lesson1Name !== lesson2Name) {
        description += ` between "${lesson1Name}" and "${lesson2Name}"`;
      }
    }

    return description;
  }

  private formatConstraintName(name: string): string {
    // Convert camelCase to readable format
    return name
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }

  formatDay(day: string | undefined): string {
    if (!day) return 'N/A';
    const dayMap: { [key: string]: string } = {
      'MONDAY': 'Monday',
      'TUESDAY': 'Tuesday',
      'WEDNESDAY': 'Wednesday',
      'THURSDAY': 'Thursday',
      'FRIDAY': 'Friday',
    };
    return dayMap[day] || day;
  }

  formatTimeslot(timeslot: Timeslot | undefined): string {
    if (!timeslot) return 'Unassigned';
    return `${this.formatDay(timeslot.dayOfWeek)} ${timeslot.startTime?.substring(0, 5)} - ${timeslot.endTime?.substring(0, 5)}`;
  }

  getScoreDiff(): { hard: number; medium: number; soft: number } {
    const prev = this.data.previousScore || { hardScore: 0, mediumScore: 0, softScore: 0 };
    const next = this.data.newScore || { hardScore: 0, mediumScore: 0, softScore: 0 };
    
    return {
      hard: next.hardScore - prev.hardScore,
      medium: next.mediumScore - prev.mediumScore,
      soft: next.softScore - prev.softScore,
    };
  }

  getScoreClass(diff: number): string {
    if (diff > 0) return 'score-improved';
    if (diff < 0) return 'score-worsened';
    return 'score-unchanged';
  }

  getBreakdownClass(value: number): string {
    if (value < 0) return 'score-worsened';
    if (value === 0) return 'score-unchanged';
    return 'score-improved';
  }

  hasViolations(): boolean {
    return this.displayedViolations.length > 0;
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
