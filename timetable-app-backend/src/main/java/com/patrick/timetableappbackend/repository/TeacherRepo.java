package com.patrick.timetableappbackend.repository;

import com.patrick.timetableappbackend.model.Teacher;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface TeacherRepo extends JpaRepository<Teacher, Long> {
  public List<Teacher> findAllByOrderByIdAsc();

  @Query("SELECT t FROM Teacher t LEFT JOIN FETCH t.timeslots ORDER BY t.id")
  public List<Teacher> findAllTeachersWithTimeslotsOrderedById();
}
