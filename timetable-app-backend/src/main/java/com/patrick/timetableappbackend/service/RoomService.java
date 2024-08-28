package com.patrick.timetableappbackend.service;

import com.patrick.timetableappbackend.model.Room;
import com.patrick.timetableappbackend.repository.RoomRepo;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class RoomService {

  private final RoomRepo roomRepo;

  public List<Room> getAllRoom() {
    return roomRepo.findAllByOrderByIdAsc();
  }

  public Optional<Room> getRoomById(Long id) {
    return roomRepo.findById(id);
  }

  public long getRoomCount() {
    return roomRepo.count();
  }

  public Room createRoom(Room room) {
    return roomRepo.save(room);
  }

  public Room updateRoom(Long id, Room updatedRoom) {
    if (roomRepo.existsById(id)) {
      updatedRoom =
          Room.builder()
              .id(id)
              .name(updatedRoom.getName())
              .capacity(updatedRoom.getCapacity())
              .building(updatedRoom.getBuilding())
              .build();

      return roomRepo.save(updatedRoom);
    } else {
      throw new RuntimeException("Room not found with id: " + id);
    }
  }

  public void deleteRoom(Long id) {
    roomRepo.deleteById(id);
  }
}
