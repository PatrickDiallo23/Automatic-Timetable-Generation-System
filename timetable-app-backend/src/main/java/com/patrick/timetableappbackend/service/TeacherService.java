package com.patrick.timetableappbackend.service;

import com.patrick.timetableappbackend.dto.TeacherDTO;
import com.patrick.timetableappbackend.dto.TeacherTimeslotDTO;
import com.patrick.timetableappbackend.model.Teacher;
import com.patrick.timetableappbackend.repository.TeacherRepo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TeacherService {

    private final TeacherRepo teacherRepo;
    private final ModelMapper modelMapper;

    @Transactional(readOnly = true)
    public List<TeacherDTO> getAllTeachers() {
        List<Teacher> retrievedTeachers = teacherRepo.findAllTeachersOrderedById();
        return retrievedTeachers.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Optional<Teacher> getTeacherById(Long id) {
        return teacherRepo.findById(id);
    }

    public long getTeacherCount() {
        return teacherRepo.count();
    }

    @Transactional
    public Teacher createTeacher(Teacher teacher) {
        return teacherRepo.save(teacher);
    }

    @Transactional
    public Teacher updateTeacher(Long id, Teacher updatedTeacher) {
        return teacherRepo.findById(id)
                .map(existingTeacher -> {
                    existingTeacher.setName(updatedTeacher.getName());

                    // Update preferred timeslots
                    if (updatedTeacher.getPreferredTimeslots() != null) {
                        existingTeacher.setPreferredTimeslots(updatedTeacher.getPreferredTimeslots());
                    }
                    return teacherRepo.save(existingTeacher);
                })
                .orElseThrow(() -> new RuntimeException("Teacher not found with id: " + id));
    }

    @Transactional
    public void deleteTeacher(Long id) {
        teacherRepo.deleteById(id);
    }

    private TeacherDTO convertToDTO(Teacher teacher) {
        TeacherDTO teacherDTO = modelMapper.map(teacher, TeacherDTO.class);
        Set<TeacherTimeslotDTO> teacherTimeslotDTOs = teacher.getPreferredTimeslots().stream()
                .map(timeslot -> modelMapper.map(timeslot, TeacherTimeslotDTO.class))
                .collect(Collectors.toSet());
        teacherDTO.setPreferredTimeslots(teacherTimeslotDTOs);
        return teacherDTO;
    }
}
