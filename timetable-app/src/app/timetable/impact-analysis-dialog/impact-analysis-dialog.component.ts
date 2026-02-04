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
}

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

  private processViolations(): void {
    if (!this.data.analysisData?.constraints) {
      this.displayedViolations = [];
      return;
    }

    const lessonId = this.data.change.lesson.id;
    const relevantViolations: ConstraintViolation[] = [];

    for (const constraint of this.data.analysisData.constraints) {
      if (!constraint.matches || constraint.matches.length === 0) continue;

      const relevantMatches = constraint.matches.filter((match: any) => {
        const justification = match.justification;
        if (!justification) return false;

        // Check if lesson1 or lesson2 in the justification matches our edited lesson
        const lesson1Id = justification.lesson1?.id;
        const lesson2Id = justification.lesson2?.id;
        
        return lesson1Id === lessonId || lesson2Id === lessonId;
      });

      if (relevantMatches.length > 0) {
        const constraintType = this.getConstraintType(constraint);
        
        for (const match of relevantMatches) {
          const affectedLessons: Lesson[] = [];
          const justification = match.justification;
          
          if (justification.lesson1 && justification.lesson1.id !== lessonId) {
            affectedLessons.push(this.resolveLesson(justification.lesson1));
          }
          if (justification.lesson2 && justification.lesson2.id !== lessonId) {
            affectedLessons.push(this.resolveLesson(justification.lesson2));
          }

          const rawDescription = justification.description || '';
          const cleanedDescription = this.cleanDescription(rawDescription, constraint.name, justification);

          relevantViolations.push({
            constraintName: constraint.name,
            constraintType: constraintType,
            description: cleanedDescription || this.generateDescription(constraint.name, match),
            affectedLessons: affectedLessons,
            score: match.score,
          });
        }
      }
    }

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

  private getConstraintType(constraint: any): 'hard' | 'medium' | 'soft' {
    const weight = constraint.weight || '';
    if (weight.includes('hard') && !weight.startsWith('0hard')) return 'hard';
    if (weight.includes('medium') && !weight.includes('/0medium')) return 'medium';
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

  hasViolations(): boolean {
    return this.displayedViolations.length > 0;
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
