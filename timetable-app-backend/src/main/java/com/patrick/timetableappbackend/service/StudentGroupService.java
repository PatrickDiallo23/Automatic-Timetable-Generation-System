package com.patrick.timetableappbackend.service;

import com.patrick.timetableappbackend.model.StudentGroup;
import com.patrick.timetableappbackend.repository.StudentGroupRepo;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class StudentGroupService {

  private final StudentGroupRepo studentGroupRepo;

  public List<StudentGroup> getAllStudentGroups() {
    return studentGroupRepo.findAllByOrderByIdAsc();
  }

  public Optional<StudentGroup> getStudentGroupById(Long id) {
    return studentGroupRepo.findById(id);
  }

  public long getStudentGroupCount() {
    return studentGroupRepo.count();
  }

  public StudentGroup createStudentGroup(StudentGroup studentGroup) {
    return studentGroupRepo.save(studentGroup);
  }

  public StudentGroup updateStudentGroup(Long id, StudentGroup updatedStudentGroup) {
    if (studentGroupRepo.existsById(id)) {
      updatedStudentGroup =
          StudentGroup.builder()
              .id(updatedStudentGroup.getId())
              .year(updatedStudentGroup.getYear())
              .name(updatedStudentGroup.getName())
              .studentGroup(updatedStudentGroup.getStudentGroup())
              .semiGroup(updatedStudentGroup.getSemiGroup())
              .numberOfStudents(updatedStudentGroup.getNumberOfStudents())
              .build();
      return studentGroupRepo.save(updatedStudentGroup);
    } else {
      throw new RuntimeException("Student group not found with id: " + id);
    }
  }

  public void deleteStudentGroup(Long id) {
    studentGroupRepo.deleteById(id);
  }
}
