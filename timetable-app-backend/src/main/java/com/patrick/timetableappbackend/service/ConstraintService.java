package com.patrick.timetableappbackend.service;

import com.patrick.timetableappbackend.model.ConstraintModel;
import com.patrick.timetableappbackend.repository.ConstraintRepo;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class ConstraintService {

  private final ConstraintRepo constraintRepo;

  public List<ConstraintModel> getAllConstraints() {
    return constraintRepo.findAllByOrderByIdAsc();
  }

  public Optional<ConstraintModel> getConstraintById(Long id) {
    return constraintRepo.findById(id);
  }

  public long getConstraintCount() {
    return constraintRepo.count();
  }

  public ConstraintModel createConstraint(ConstraintModel constraintModel) {
    return constraintRepo.save(constraintModel);
  }

  public ConstraintModel updateConstraint(Long id, ConstraintModel updatedConstraintModel) {
    if (constraintRepo.existsById(id)) {
      updatedConstraintModel =
          ConstraintModel.builder()
              .id(id)
              .description(updatedConstraintModel.getDescription())
              .weight(updatedConstraintModel.getWeight())
              .build();
      return constraintRepo.save(updatedConstraintModel);
    } else {
      throw new RuntimeException("Constraint not found with id: " + id);
    }
  }

  public void deleteConstraint(Long id) {
    constraintRepo.deleteById(id);
  }
}
