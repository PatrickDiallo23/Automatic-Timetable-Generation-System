package com.patrick.timetableappbackend.repository;

import com.patrick.timetableappbackend.model.ConstraintModel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ConstraintRepo extends JpaRepository<ConstraintModel, Long> {
    public List<ConstraintModel> findAllByOrderByIdAsc();
}
