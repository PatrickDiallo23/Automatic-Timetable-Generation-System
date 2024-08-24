import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomDialogComponent } from './room-dialog.component';

describe('RoomDialogComponent', () => {
  let component: RoomDialogComponent;
  let fixture: ComponentFixture<RoomDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RoomDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoomDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
