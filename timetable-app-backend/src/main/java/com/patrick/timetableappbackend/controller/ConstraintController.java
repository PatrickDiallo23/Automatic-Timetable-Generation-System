package com.patrick.timetableappbackend.controller;

import com.patrick.timetableappbackend.model.ConstraintModel;
import com.patrick.timetableappbackend.service.ConstraintService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/constraints")
@RequiredArgsConstructor
@Slf4j
public class ConstraintController {

  private final ConstraintService constraintService;

  @GetMapping
  public ResponseEntity<List<ConstraintModel>> getAllConstraints() {
    List<ConstraintModel> constraintModels = constraintService.getAllConstraints();
    return new ResponseEntity<>(constraintModels, HttpStatus.OK);
  }

  @GetMapping("/{id}")
  public ResponseEntity<ConstraintModel> getConstraintById(@PathVariable Long id) {
    return constraintService
        .getConstraintById(id)
        .map(constraintModel -> new ResponseEntity<>(constraintModel, HttpStatus.OK))
        .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
  }

  @GetMapping("/count")
  public ResponseEntity<Long> getConstraintCount() {
    long constraintCount = constraintService.getConstraintCount();
    return new ResponseEntity<>(constraintCount, HttpStatus.OK);
  }

  @PostMapping
  public ResponseEntity<ConstraintModel> createConstraint(
      @RequestBody ConstraintModel constraintModel) {
    ConstraintModel createdConstraintModel = constraintService.createConstraint(constraintModel);
    return new ResponseEntity<>(createdConstraintModel, HttpStatus.CREATED);
  }

  @PutMapping("/{id}")
  public ResponseEntity<ConstraintModel> updateConstraint(
      @PathVariable Long id, @RequestBody ConstraintModel updatedConstraintModel) {
    try {
      ConstraintModel updated = constraintService.updateConstraint(id, updatedConstraintModel);
      return new ResponseEntity<>(updated, HttpStatus.OK);
    } catch (RuntimeException e) {
      return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deleteConstraint(@PathVariable Long id) {
    constraintService.deleteConstraint(id);
    return new ResponseEntity<>(HttpStatus.NO_CONTENT);
  }
}
