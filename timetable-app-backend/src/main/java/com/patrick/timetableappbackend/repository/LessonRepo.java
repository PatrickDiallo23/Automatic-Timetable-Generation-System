package com.patrick.timetableappbackend.repository;

import com.patrick.timetableappbackend.model.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface LessonRepo extends JpaRepository<Lesson,Long> {
    public List<Lesson> findAllByOrderByIdAsc();
    @Query("SELECT DISTINCT l FROM Lesson l " +
            "LEFT JOIN FETCH l.teacher t " +
            "LEFT JOIN FETCH t.preferredTimeslots " +
            "LEFT JOIN FETCH l.studentGroup " +
            "LEFT JOIN FETCH l.timeslot " +
            "LEFT JOIN FETCH l.room " +
            "ORDER BY l.id")
    List<Lesson> findAllLessonsOrderedById();

    @Query("SELECT l FROM Lesson l " +
            "LEFT JOIN FETCH l.teacher t " +
            "LEFT JOIN FETCH t.preferredTimeslots " +
            "LEFT JOIN FETCH l.studentGroup " +
            "LEFT JOIN FETCH l.timeslot " +
            "LEFT JOIN FETCH l.room " +
            "WHERE l.id = :id")
    Optional<Lesson> findLessonsById(Long id);
}
