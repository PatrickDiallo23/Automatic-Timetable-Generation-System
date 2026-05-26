package com.patrick.timetableappbackend.solver.justifications;

import ai.timefold.solver.core.api.score.stream.ConstraintJustification;
import com.patrick.timetableappbackend.model.Lesson;

public record GapsLongerThan4HoursJustification(Lesson lesson1, Lesson lesson2, String description) implements ConstraintJustification {
    public GapsLongerThan4HoursJustification(Lesson lesson1, Lesson lesson2) {
        this(lesson1, lesson2,
                "There is a gap of more than 4 hours between lesson '%s' and lesson '%s' for student group '%s' on %s."
                        .formatted(lesson1.getSubject(), lesson2.getSubject(), lesson1.getStudentGroup().getName(), lesson1.getTimeslot().getDayOfWeek()));
    }
}
