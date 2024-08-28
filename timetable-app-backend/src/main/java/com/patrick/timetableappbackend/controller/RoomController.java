package com.patrick.timetableappbackend.controller;

import com.patrick.timetableappbackend.model.Room;
import com.patrick.timetableappbackend.service.RoomService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/rooms")
@RequiredArgsConstructor
@Slf4j
public class RoomController {

  private final RoomService roomService;

  @GetMapping
  public ResponseEntity<List<Room>> getAllRooms() {
    List<Room> rooms = roomService.getAllRoom();
    return new ResponseEntity<>(rooms, HttpStatus.OK);
  }

  @GetMapping("/{id}")
  public ResponseEntity<Room> getRoomById(@PathVariable Long id) {
    return roomService
        .getRoomById(id)
        .map(room -> new ResponseEntity<>(room, HttpStatus.OK))
        .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
  }

  @GetMapping("/count")
  public ResponseEntity<Long> getRoomCount() {
    long roomCount = roomService.getRoomCount();
    return new ResponseEntity<>(roomCount, HttpStatus.OK);
  }

  @PostMapping
  public ResponseEntity<Room> createRoom(@RequestBody Room room) {
    Room createdRoom = roomService.createRoom(room);
    return new ResponseEntity<>(createdRoom, HttpStatus.CREATED);
  }

  @PutMapping("/{id}")
  public ResponseEntity<Room> updateRoom(@PathVariable Long id, @RequestBody Room updatedRoom) {
    try {
      Room updated = roomService.updateRoom(id, updatedRoom);
      return new ResponseEntity<>(updated, HttpStatus.OK);
    } catch (RuntimeException e) {
      return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deleteRoom(@PathVariable Long id) {
    roomService.deleteRoom(id);
    return new ResponseEntity<>(HttpStatus.NO_CONTENT);
  }
}
