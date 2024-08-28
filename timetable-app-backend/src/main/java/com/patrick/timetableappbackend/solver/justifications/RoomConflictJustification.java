package com.patrick.timetableappbackend.solver.justifications;

import ai.timefold.solver.core.api.score.stream.ConstraintJustification;
import com.patrick.timetableappbackend.model.Lesson;
import com.patrick.timetableappbackend.model.Room;

public record RoomConflictJustification(
    Room room, Lesson lesson1, Lesson lesson2, String description)
    implements ConstraintJustification {

  public RoomConflictJustification(Room room, Lesson lesson1, Lesson lesson2) {
    this(
        room,
        lesson1,
        lesson2,
        "Room '%s' is used for lesson '%s' for student group '%s' and lesson '%s' for student group '%s' at '%s %s'"
            .formatted(
                room,
                lesson1.getSubject(),
                lesson1.getStudentGroup(),
                lesson2.getSubject(),
                lesson2.getStudentGroup(),
                lesson1.getTimeslot().getDayOfWeek(),
                lesson1.getTimeslot().getStartTime()));
  }
}
