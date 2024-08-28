package com.patrick.timetableappbackend.solver.justifications;

import ai.timefold.solver.core.api.score.stream.ConstraintJustification;
import com.patrick.timetableappbackend.model.Lesson;
import com.patrick.timetableappbackend.model.StudentGroup;

public record StudentGroupConflictJustification(
    String studentGroup, Lesson lesson1, Lesson lesson2, String description)
    implements ConstraintJustification {
  public StudentGroupConflictJustification(
      StudentGroup studentGroup, Lesson lesson1, Lesson lesson2) {
    this(
        studentGroup.getName(),
        lesson1,
        lesson2,
        "Student group '%s' has lesson '%s' and lesson '%s' at '%s %s'"
            .formatted(
                studentGroup,
                lesson1.getSubject(),
                lesson2.getSubject(),
                lesson1.getTimeslot().getDayOfWeek(),
                lesson1.getTimeslot().getStartTime()));
  }
}
