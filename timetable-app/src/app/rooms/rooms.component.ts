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

  // Filter values
  filterValues: any = {
    name: '',
    building: '',
    capacity: null
  };

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
      this.dataSource.paginator = this.paginator;

      this.dataSource.filterPredicate = (data: Room, filter: string) => {
        const searchTerms = JSON.parse(filter);
        
        const nameMatch = !searchTerms.name || (data.name?.toLowerCase().includes(searchTerms.name.toLowerCase()));
        const buildingMatch = !searchTerms.building || (data.building?.toLowerCase().includes(searchTerms.building.toLowerCase()));
        const capacityMatch = !searchTerms.capacity || (data.capacity ? data.capacity >= searchTerms.capacity : false);

        return Boolean(nameMatch && buildingMatch && capacityMatch);
      };
    });
  }

  applyFilter(field: string, value: any) {
    if (field === 'capacity') {
        this.filterValues[field] = value ? Number(value) : null;
    } else {
        this.filterValues[field] = value;
    }
    this.dataSource.filter = JSON.stringify(this.filterValues);

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  resetFilters() {
    this.filterValues = {
      name: '',
      building: '',
      capacity: null
    };
    this.dataSource.filter = JSON.stringify(this.filterValues);

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

}

