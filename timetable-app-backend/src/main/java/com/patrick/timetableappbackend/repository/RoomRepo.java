package com.patrick.timetableappbackend.repository;

import com.patrick.timetableappbackend.model.Room;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RoomRepo extends JpaRepository<Room, Long> {

    public List<Room> findAllByOrderByIdAsc();
}
