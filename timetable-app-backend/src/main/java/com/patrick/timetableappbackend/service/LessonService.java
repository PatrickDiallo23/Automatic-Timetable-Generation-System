package com.patrick.timetableappbackend.service;

import com.patrick.timetableappbackend.model.Lesson;
import com.patrick.timetableappbackend.repository.*;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class LessonService {

  private final LessonRepo lessonRepo;
  private final TeacherRepo teacherRepo;
  private final StudentGroupRepo studentGroupRepo;

  public List<Lesson> getAllLessons() {
    return lessonRepo.findAllByOrderByIdAsc();
  }

  public Optional<Lesson> getLessonById(Long id) {
    return lessonRepo.findById(id);
  }

  public Long getLessonCount() {
    return lessonRepo.count();
  }

  public Lesson createLesson(Lesson lesson) {
    //        Lesson createdLesson = Lesson.builder()
    //                .id(lesson.getId())
    //                .subject(lesson.getSubject())
    //                .teacher(teacherRepo.findById(lesson.getTeacher().getId()).orElseThrow(() ->
    // new RuntimeException("No teacher found with that id")))
    //
    // .studentGroup(studentGroupRepo.findById(lesson.getStudentGroup().getId()).orElseThrow(() ->
    // new RuntimeException("No student group found with that id")))
    //                .lessonType(lesson.getLessonType())
    //                .year(lesson.getYear())
    //                .duration(lesson.getDuration())
    //                .build();

    return lessonRepo.save(lesson);
    //        return lessonRepo.save(createdLesson);
  }

  public Lesson updateLesson(Long id, Lesson updatedLesson) {
    // check if we need timeslot and room in update method
    // todo: solve update method
    if (lessonRepo.existsById(id)) {
      updatedLesson =
          Lesson.builder()
              .id(updatedLesson.getId())
              .subject(updatedLesson.getSubject())
              .teacher(updatedLesson.getTeacher())
              .studentGroup(updatedLesson.getStudentGroup())
              .lessonType(updatedLesson.getLessonType())
              .year(updatedLesson.getYear())
              .duration(updatedLesson.getDuration())
              .build();
      return lessonRepo.save(updatedLesson);
    } else {
      throw new RuntimeException("Lesson not found with id: " + id);
    }
  }

  public void deleteLesson(Long id) {
    lessonRepo.deleteById(id);
  }
}
