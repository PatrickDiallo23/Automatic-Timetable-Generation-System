package com.patrick.timetableappbackend.controller;

import com.patrick.timetableappbackend.dto.TeacherDTO;
import com.patrick.timetableappbackend.model.Teacher;
import com.patrick.timetableappbackend.service.TeacherService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/teachers")
@RequiredArgsConstructor
@Slf4j
public class TeacherController {

  private final TeacherService teacherService;

  @GetMapping
  public ResponseEntity<List<TeacherDTO>> getAllTeachers() {
    List<TeacherDTO> teachers = teacherService.getAllTeachers();
    return new ResponseEntity<>(teachers, HttpStatus.OK);
  }

  @GetMapping("/{id}")
  public ResponseEntity<Teacher> getTeacherById(@PathVariable Long id) {
    return teacherService
        .getTeacherById(id)
        .map(professor -> new ResponseEntity<>(professor, HttpStatus.OK))
        .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
  }

  @GetMapping("/count")
  public ResponseEntity<Long> getTeachersCount() {
    long teacherCount = teacherService.getTeacherCount();
    return new ResponseEntity<>(teacherCount, HttpStatus.OK);
  }

  @PostMapping
  public ResponseEntity<Teacher> createTeacher(@RequestBody Teacher teacher) {
    Teacher createdTeacher = teacherService.createTeacher(teacher);
    return new ResponseEntity<>(createdTeacher, HttpStatus.CREATED);
  }

  @PutMapping("/{id}")
  public ResponseEntity<Teacher> updateTeacher(
      @PathVariable Long id, @RequestBody Teacher updatedTeacher) {
    try {
      Teacher updated = teacherService.updateTeacher(id, updatedTeacher);
      return new ResponseEntity<>(updated, HttpStatus.OK);
    } catch (RuntimeException e) {
      return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deleteTeacher(@PathVariable Long id) {
    teacherService.deleteTeacher(id);
    return new ResponseEntity<>(HttpStatus.NO_CONTENT);
  }
}
