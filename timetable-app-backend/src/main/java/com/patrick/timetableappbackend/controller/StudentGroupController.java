package com.patrick.timetableappbackend.controller;

import com.patrick.timetableappbackend.model.StudentGroup;
import com.patrick.timetableappbackend.service.StudentGroupService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/studentGroups")
@RequiredArgsConstructor
@Slf4j
public class StudentGroupController {

  private final StudentGroupService studentGroupService;

  @GetMapping
  public ResponseEntity<List<StudentGroup>> getAllStudentGroups() {
    List<StudentGroup> studentGroups = studentGroupService.getAllStudentGroups();
    return new ResponseEntity<>(studentGroups, HttpStatus.OK);
  }

  @GetMapping("/{id}")
  public ResponseEntity<StudentGroup> getStudentGroupById(@PathVariable Long id) {
    return studentGroupService
        .getStudentGroupById(id)
        .map(studentGroup -> new ResponseEntity<>(studentGroup, HttpStatus.OK))
        .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
  }

  @GetMapping("/count")
  public ResponseEntity<Long> getStudentGroupCount() {
    long studentGroupCount = studentGroupService.getStudentGroupCount();
    return new ResponseEntity<>(studentGroupCount, HttpStatus.OK);
  }

  @PostMapping
  public ResponseEntity<StudentGroup> createStudentGroup(@RequestBody StudentGroup studentGroup) {
    StudentGroup createdStudentGroup = studentGroupService.createStudentGroup(studentGroup);
    return new ResponseEntity<>(createdStudentGroup, HttpStatus.CREATED);
  }

  @PutMapping("/{id}")
  public ResponseEntity<StudentGroup> updateStudentGroup(
      @PathVariable Long id, @RequestBody StudentGroup updatedStudentGroup) {
    try {
      StudentGroup updated = studentGroupService.updateStudentGroup(id, updatedStudentGroup);
      return new ResponseEntity<>(updated, HttpStatus.OK);
    } catch (RuntimeException e) {
      return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deleteStudentGroup(@PathVariable Long id) {
    studentGroupService.deleteStudentGroup(id);
    return new ResponseEntity<>(HttpStatus.NO_CONTENT);
  }
}
