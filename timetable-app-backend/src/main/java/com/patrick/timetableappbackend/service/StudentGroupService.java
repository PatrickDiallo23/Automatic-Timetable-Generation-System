package com.patrick.timetableappbackend.service;

import com.patrick.timetableappbackend.model.StudentGroup;
import com.patrick.timetableappbackend.repository.StudentGroupRepo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class StudentGroupService {

    private final StudentGroupRepo studentGroupRepo;

    @Transactional(readOnly = true)
    public List<StudentGroup> getAllStudentGroups() {
        return studentGroupRepo.findAllByOrderByIdAsc();
    }

    @Transactional(readOnly = true)
    public Optional<StudentGroup> getStudentGroupById(Long id) {
        return studentGroupRepo.findById(id);
    }

    public long getStudentGroupCount() {
        return studentGroupRepo.count();
    }

    @Transactional
    public StudentGroup createStudentGroup(StudentGroup studentGroup) {
        return studentGroupRepo.save(studentGroup);
    }

    @Transactional
    public StudentGroup updateStudentGroup(Long id, StudentGroup updatedStudentGroup) {
        return studentGroupRepo.findById(id)
                .map(existingGroup -> {
                    existingGroup.setYear(updatedStudentGroup.getYear());
                    existingGroup.setName(updatedStudentGroup.getName());
                    existingGroup.setStudentGroup(updatedStudentGroup.getStudentGroup());
                    existingGroup.setSemiGroup(updatedStudentGroup.getSemiGroup());
                    existingGroup.setNumberOfStudents(updatedStudentGroup.getNumberOfStudents());
                    return studentGroupRepo.save(existingGroup);
                })
                .orElseThrow(() -> new RuntimeException("No student group found with id " + id));
    }

    @Transactional
    public void deleteStudentGroup(Long id) {
        studentGroupRepo.deleteById(id);
    }

}
