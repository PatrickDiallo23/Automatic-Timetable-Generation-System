package com.patrick.timetableappbackend.service;

import com.patrick.timetableappbackend.model.ConstraintModel;
import com.patrick.timetableappbackend.repository.ConstraintRepo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ConstraintService {

    private final ConstraintRepo constraintRepo;

    @Transactional(readOnly = true)
    public List<ConstraintModel> getAllConstraints() {
        return constraintRepo.findAllByOrderByIdAsc();
    }

    @Transactional(readOnly = true)
    public Optional<ConstraintModel> getConstraintById(Long id) {
        return constraintRepo.findById(id);
    }

    public long getConstraintCount() {
        return constraintRepo.count();
    }

    @Transactional
    public ConstraintModel createConstraint(ConstraintModel constraintModel) {
        return constraintRepo.save(constraintModel);
    }

    @Transactional
    public ConstraintModel updateConstraint(Long id, ConstraintModel updatedConstraintModel) {
        return constraintRepo.findById(id)
                .map(existingConstraint -> {
                    existingConstraint.setDescription(updatedConstraintModel.getDescription());
                    existingConstraint.setWeight(updatedConstraintModel.getWeight());
                    return constraintRepo.save(existingConstraint);
                })
                .orElseThrow(() -> new RuntimeException("No constraint found with id " + id));
    }

    @Transactional
    public void deleteConstraint(Long id) {
        constraintRepo.deleteById(id);
    }

}
