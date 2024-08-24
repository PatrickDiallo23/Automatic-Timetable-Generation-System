package com.patrick.timetableappbackend.repository;

import com.patrick.timetableappbackend.model.Teacher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface TeacherRepo extends JpaRepository<Teacher,Long> {
    public List<Teacher> findAllByOrderByIdAsc();
    @Query("SELECT t FROM Teacher t LEFT JOIN FETCH t.timeslots ORDER BY t.id")
    public List<Teacher> findAllTeachersWithTimeslotsOrderedById();
}
