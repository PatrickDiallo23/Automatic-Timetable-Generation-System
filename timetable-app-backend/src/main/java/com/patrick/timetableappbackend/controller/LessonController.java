package com.patrick.timetableappbackend.controller;

import com.patrick.timetableappbackend.model.Lesson;
import com.patrick.timetableappbackend.service.LessonService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/lessons")
@RequiredArgsConstructor
@Slf4j
public class LessonController {

  private final LessonService lessonService;

  @GetMapping
  public ResponseEntity<List<Lesson>> getAllLessons() {
    List<Lesson> lessons = lessonService.getAllLessons();
    return new ResponseEntity<>(lessons, HttpStatus.OK);
  }

  @GetMapping("/{id}")
  public ResponseEntity<Lesson> getLessonById(@PathVariable Long id) {
    return lessonService
        .getLessonById(id)
        .map(lesson -> new ResponseEntity<>(lesson, HttpStatus.OK))
        .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
  }

  @GetMapping("/count")
  public ResponseEntity<Long> getLessonCount() {
    long lessonCount = lessonService.getLessonCount();
    return new ResponseEntity<>(lessonCount, HttpStatus.OK);
  }

  @PostMapping
  public ResponseEntity<Lesson> createLesson(@RequestBody Lesson lesson) {
    Lesson createdLesson = lessonService.createLesson(lesson);
    return new ResponseEntity<>(createdLesson, HttpStatus.CREATED);
  }

  @PutMapping("/{id}")
  public ResponseEntity<Lesson> updateLesson(
      @PathVariable Long id, @RequestBody Lesson updatedLesson) {
    try {
      Lesson updated = lessonService.updateLesson(id, updatedLesson);
      return new ResponseEntity<>(updated, HttpStatus.OK);
    } catch (RuntimeException e) {
      return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deleteLesson(@PathVariable Long id) {
    lessonService.deleteLesson(id);
    return new ResponseEntity<>(HttpStatus.NO_CONTENT);
  }
}
