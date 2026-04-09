package com.patrick.timetableappbackend.solver.justifications;

import ai.timefold.solver.core.api.score.stream.ConstraintJustification;
import com.patrick.timetableappbackend.model.Lesson;

public record OverlappingTimeslotJustification(Lesson lesson1, Lesson lesson2, String description) implements ConstraintJustification {

    public OverlappingTimeslotJustification(Lesson lesson1, Lesson lesson2) {
        this(lesson1, lesson2,
                "Overlapping timeslots for student group '%s': lesson '%s' at %s %s and lesson '%s' at %s %s."
                        .formatted(lesson1.getStudentGroup().getName(),
                                lesson1.getSubject(), lesson1.getTimeslot().getDayOfWeek(), lesson1.getTimeslot().getStartTime(),
                                lesson2.getSubject(), lesson2.getTimeslot().getDayOfWeek(), lesson2.getTimeslot().getStartTime()));
    }
}
