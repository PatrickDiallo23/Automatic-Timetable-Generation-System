import { MatTableDataSource } from '@angular/material/table';
import { Component, OnInit, ViewChild } from '@angular/core';
import { RoomService } from './room.service';
import { MatDialog } from '@angular/material/dialog';
import { RoomDialogComponent } from './room-dialog/room-dialog.component';
import { CoreService } from '../core/core.service';
import { MatPaginator } from '@angular/material/paginator';
import { Room } from '../model/timetableEntities';

@Component({
  selector: 'app-rooms',
  templateUrl: './rooms.component.html',
  styleUrls: ['./rooms.component.css'],
})
export class RoomsComponent implements OnInit {

  newRoom: Room = {};
  dataSource = new MatTableDataSource<Room>([]);
  displayedColumns: string[] = ['name', 'capacity', 'building', 'action'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  // @ViewChild(MatTable) table!: MatTable<Room>;

  constructor(
    private roomService: RoomService,
    private dialog: MatDialog,
    private coreService: CoreService
  ) {}

  ngOnInit(): void {
    this.loadRooms();
  }

  // credit: https://github.com/Tariqu/angular-crud-app/blob/master/src/app/services/employee.service.ts
  openAddEditRoomForm() {
    const dialogRef = this.dialog.open(RoomDialogComponent);
    dialogRef.afterClosed().subscribe({
      next: (val) => {
        if (val) {
          console.log(val);
          this.loadRooms();
        }
      },
    });
  }

  deleteRoom(id: number) {
    this.roomService.deleteRoom(id).subscribe({
      next: (res) => {
        this.coreService.openSnackBar('Room deleted!', 'done');
        this.loadRooms();
      },
      error: console.log,
    });
  }

  openEditForm(data: any) {
    const dialogRef = this.dialog.open(RoomDialogComponent, {
      data,
    });

    dialogRef.afterClosed().subscribe({
      next: (val) => {
        if (val) {
          this.loadRooms();
        }
      },
    });
  }

  addRoom() {
    this.roomService.createRoom(this.newRoom).subscribe((createdRoom) => {
      this.dataSource.data = [...this.dataSource.data, createdRoom];
      // this.table.renderRows();
      this.newRoom = {};
    });
  }

  loadRooms() {
    this.roomService.getAllRooms().subscribe((rooms) => {
      this.dataSource.data = rooms;
      console.log(rooms);
      this.dataSource.paginator = this.paginator;
    });
  }

}

