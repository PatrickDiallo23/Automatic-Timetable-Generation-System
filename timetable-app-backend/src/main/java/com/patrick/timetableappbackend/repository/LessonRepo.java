package com.patrick.timetableappbackend.repository;

import com.patrick.timetableappbackend.model.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LessonRepo extends JpaRepository<Lesson,Long> {
    public List<Lesson> findAllByOrderByIdAsc();
}
