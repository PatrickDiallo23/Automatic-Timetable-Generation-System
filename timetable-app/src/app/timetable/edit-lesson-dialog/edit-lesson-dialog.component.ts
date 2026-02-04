import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormControl, FormGroup } from '@angular/forms';
import { Lesson, Room, Timeslot } from '../../model/timetableEntities';

export interface EditLessonDialogData {
  lesson: Lesson;
  rooms: Room[];
  timeslots: Timeslot[];
  currentRoom: Room | undefined;
  currentTimeslot: Timeslot | undefined;
}

export interface EditLessonDialogResult {
  lesson: Lesson;
  originalRoom: number | undefined;
  originalTimeslot: number | undefined;
  newRoom: number;
  newTimeslot: number;
}

@Component({
  selector: 'app-edit-lesson-dialog',
  templateUrl: './edit-lesson-dialog.component.html',
  styleUrls: ['./edit-lesson-dialog.component.css'],
})
export class EditLessonDialogComponent implements OnInit {
  editForm: FormGroup;
  groupedTimeslots: Map<string, Timeslot[]> = new Map();
  dayOrder = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];

  constructor(
    public dialogRef: MatDialogRef<EditLessonDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EditLessonDialogData
  ) {
    this.editForm = new FormGroup({
      roomControl: new FormControl(this.data.lesson.room),
      timeslotControl: new FormControl(this.data.lesson.timeslot),
    });
  }

  ngOnInit(): void {
    this.groupTimeslotsByDay();
  }

  private groupTimeslotsByDay(): void {
    this.groupedTimeslots = new Map();
    
    this.dayOrder.forEach(day => {
      const slots = this.data.timeslots
        .filter(ts => ts.dayOfWeek === day)
        .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
      
      if (slots.length > 0) {
        this.groupedTimeslots.set(day, slots);
      }
    });
  }

  formatDay(day: string): string {
    const dayMap: { [key: string]: string } = {
      'MONDAY': 'Monday',
      'TUESDAY': 'Tuesday',
      'WEDNESDAY': 'Wednesday',
      'THURSDAY': 'Thursday',
      'FRIDAY': 'Friday',
    };
    return dayMap[day] || day;
  }

  formatTimeslot(timeslot: Timeslot): string {
    return `${timeslot.startTime?.substring(0, 5)} - ${timeslot.endTime?.substring(0, 5)}`;
  }

  getRoomById(roomId: number): Room | undefined {
    return this.data.rooms.find(r => r.id === roomId);
  }

  getTimeslotById(timeslotId: number): Timeslot | undefined {
    return this.data.timeslots.find(ts => ts.id === timeslotId);
  }

  hasChanges(): boolean {
    const currentRoomId = this.editForm.get('roomControl')?.value;
    const currentTimeslotId = this.editForm.get('timeslotControl')?.value;
    
    return currentRoomId !== this.data.lesson.room || 
           currentTimeslotId !== this.data.lesson.timeslot;
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }

  onSave(): void {
    if (!this.hasChanges()) {
      this.dialogRef.close(null);
      return;
    }

    const result: EditLessonDialogResult = {
      lesson: { ...this.data.lesson },
      originalRoom: this.data.lesson.room,
      originalTimeslot: this.data.lesson.timeslot,
      newRoom: this.editForm.get('roomControl')?.value,
      newTimeslot: this.editForm.get('timeslotControl')?.value,
    };

    this.dialogRef.close(result);
  }
}
