import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class CoreService {
  constructor(private snackBar: MatSnackBar) {}

  openSnackBar(message: string, action: string = 'ok') {
    this.snackBar.open(message, action, {
      duration: 3000,
      verticalPosition: 'bottom',
    });
  }
}
