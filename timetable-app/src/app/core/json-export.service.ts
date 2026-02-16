import { Injectable } from '@angular/core';
import { Timetable } from '../model/timetableEntities';

@Injectable({
  providedIn: 'root'
})
export class JsonExportService {

  constructor() { }

  exportTimetable(data: Timetable, fileName: string = 'timetable_export'): void {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}.json`;
    a.click();

    window.URL.revokeObjectURL(url);
  }
}
