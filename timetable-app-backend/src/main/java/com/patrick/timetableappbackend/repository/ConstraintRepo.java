package com.patrick.timetableappbackend.repository;

import com.patrick.timetableappbackend.model.ConstraintModel;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ConstraintRepo extends JpaRepository<ConstraintModel, Long> {

  List<ConstraintModel> findAllByOrderByIdAsc();
}
