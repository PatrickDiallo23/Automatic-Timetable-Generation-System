import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CoreService } from 'src/app/core/core.service';
import { RoomService } from '../room.service';

@Component({
  selector: 'app-room-dialog',
  templateUrl: './room-dialog.component.html',
  styleUrls: ['./room-dialog.component.css'],
})
export class RoomDialogComponent implements OnInit {
  
  roomForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private roomService: RoomService,
    private coreService: CoreService,
    private dialogRef: MatDialogRef<RoomDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.roomForm = this.fb.group({
      name: '',
      capacity: null, // or 0
      building: ''
    });
  }

  ngOnInit(): void {
    this.roomForm.patchValue(this.data);
  }

  onFormSubmit() {
    if (this.roomForm.valid) {
      if (this.data) {
        this.roomService
          .updateRoom(this.data.id, this.roomForm.value)
          .subscribe({
            next: (val: any) => {
              this.coreService.openSnackBar('Room detail updated!');
              this.dialogRef.close(true);
            },
            error: (err: any) => {
              console.error(err);
            },
          });
      } else {
        this.roomService.createRoom(this.roomForm.value).subscribe({
          next: (val: any) => {
            this.coreService.openSnackBar('Room added successfully');
            this.dialogRef.close(true);
          },
          error: (err: any) => {
            console.error(err);
          },
        });
      }
    }
  }
}
