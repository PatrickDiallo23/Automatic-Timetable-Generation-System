package com.patrick.timetableappbackend.repository;

import com.patrick.timetableappbackend.model.Timeslot;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TimeslotRepo
    extends JpaRepository<com.patrick.timetableappbackend.model.Timeslot, Long> {

  List<Timeslot> findAllByOrderByIdAsc();
}
