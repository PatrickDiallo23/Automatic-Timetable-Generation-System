package com.patrick.timetableappbackend.service;

import com.patrick.timetableappbackend.model.Room;
import com.patrick.timetableappbackend.repository.RoomRepo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class RoomService {

    private final RoomRepo roomRepo;

    @Transactional(readOnly = true)
    public List<Room> getAllRoom() {
        return roomRepo.findAllByOrderByIdAsc();
    }

    @Transactional(readOnly = true)
    public Optional<Room> getRoomById(Long id) {
        return roomRepo.findById(id);
    }

    public long getRoomCount() {
        return roomRepo.count();
    }

    @Transactional
    public Room createRoom(Room room) {
        return roomRepo.save(room);
    }

    @Transactional
    public Room updateRoom(Long id, Room updatedRoom) {
        return roomRepo.findById(id)
                .map(existingRoom -> {
                    existingRoom.setName(updatedRoom.getName());
                    existingRoom.setCapacity(updatedRoom.getCapacity());
                    existingRoom.setBuilding(updatedRoom.getBuilding());
                    return roomRepo.save(existingRoom);
                })
                .orElseThrow(() -> new RuntimeException("No room found with id " + id));
    }

    @Transactional
    public void deleteRoom(Long id) {
        roomRepo.deleteById(id);
    }

}
