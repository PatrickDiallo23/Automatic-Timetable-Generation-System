package com.patrick.timetableappbackend.repository;

import com.patrick.timetableappbackend.model.Lesson;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LessonRepo extends JpaRepository<Lesson, Long> {

  List<Lesson> findAllByOrderByIdAsc();
}
