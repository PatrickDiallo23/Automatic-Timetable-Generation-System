package com.patrick.timetableappbackend.repository;

import com.patrick.timetableappbackend.model.StudentGroup;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StudentGroupRepo extends JpaRepository<StudentGroup, Long> {
    public List<StudentGroup> findAllByOrderByIdAsc();
}
