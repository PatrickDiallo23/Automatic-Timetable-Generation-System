package com.patrick.timetableappbackend.service;

import com.patrick.timetableappbackend.dto.TeacherDTO;
import com.patrick.timetableappbackend.dto.TimeslotDTO;
import com.patrick.timetableappbackend.model.Teacher;
import com.patrick.timetableappbackend.repository.TeacherRepo;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class TeacherService {

  private final TeacherRepo teacherRepo;
  private final ModelMapper modelMapper;

  public List<TeacherDTO> getAllTeachers() {
    List<Teacher> retrievedTeachers = teacherRepo.findAllTeachersWithTimeslotsOrderedById();
    return retrievedTeachers.stream().map(this::convertToDTO).collect(Collectors.toList());
  }

  public Optional<Teacher> getTeacherById(Long id) {
    return teacherRepo.findById(id);
  }

  public long getTeacherCount() {
    return teacherRepo.count();
  }

  public Teacher createTeacher(Teacher teacher) {
    return teacherRepo.save(teacher);
  }

  // todo: to solve update Teacher - it creates a new teacher instead of updating the teacher
  public Teacher updateTeacher(Long id, Teacher updatedTeacher) {
    if (teacherRepo.existsById(id)) {
      updatedTeacher =
          Teacher.builder()
              .id(updatedTeacher.getId())
              .name(updatedTeacher.getName())
              .timeslots(updatedTeacher.getTimeslots())
              .build();
      return teacherRepo.save(updatedTeacher);
    } else {
      throw new RuntimeException("Teacher not found with id: " + id);
    }
  }

  public void deleteTeacher(Long id) {
    teacherRepo.deleteById(id);
  }

  private TeacherDTO convertToDTO(Teacher teacher) {
    TeacherDTO teacherDTO = modelMapper.map(teacher, TeacherDTO.class);
    Set<TimeslotDTO> timeslotDTOs =
        teacher.getTimeslots().stream()
            .map(timeslot -> modelMapper.map(timeslot, TimeslotDTO.class))
            .collect(Collectors.toSet());
    teacherDTO.setTimeslots(timeslotDTOs);
    return teacherDTO;
  }
}
