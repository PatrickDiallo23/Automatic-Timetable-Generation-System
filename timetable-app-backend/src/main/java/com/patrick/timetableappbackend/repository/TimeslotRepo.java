package com.patrick.timetableappbackend.repository;

import com.patrick.timetableappbackend.model.Timeslot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TimeslotRepo extends JpaRepository<com.patrick.timetableappbackend.model.Timeslot, Long> {
    public List<Timeslot> findAllByOrderByIdAsc();

}
