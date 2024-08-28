package com.patrick.timetableappbackend.solver.justifications;

import ai.timefold.solver.core.api.score.stream.ConstraintJustification;
import com.patrick.timetableappbackend.model.Lesson;
import com.patrick.timetableappbackend.model.Teacher;

public record TeacherTimeEfficiencyJustification(
    String teacher, Lesson lesson1, Lesson lesson2, String description)
    implements ConstraintJustification {

  public TeacherTimeEfficiencyJustification(Teacher teacher, Lesson lesson1, Lesson lesson2) {
    this(
        teacher.getName(),
        lesson1,
        lesson2,
        "Teacher '%s' has 2 consecutive lessons: lesson '%s' for student group '%s' at '%s %s' and lesson '%s' for student group '%s' at '%s %s' (gap)"
            .formatted(
                teacher,
                lesson1.getSubject(),
                lesson1.getStudentGroup(),
                lesson1.getTimeslot().getDayOfWeek(),
                lesson1.getTimeslot().getStartTime(),
                lesson2.getSubject(),
                lesson2.getStudentGroup(),
                lesson2.getTimeslot().getDayOfWeek(),
                lesson2.getTimeslot().getStartTime()));
  }
}
