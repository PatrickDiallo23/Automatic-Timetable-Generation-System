package com.patrick.timetableappbackend.repository;

import com.patrick.timetableappbackend.model.Teacher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface TeacherRepo extends JpaRepository<Teacher,Long> {
    public List<Teacher> findAllByOrderByIdAsc();
    @Query("SELECT DISTINCT t FROM Teacher t " +
            "LEFT JOIN FETCH t.preferredTimeslots " +
            "ORDER BY t.id")
    List<Teacher> findAllTeachersOrderedById();
}
