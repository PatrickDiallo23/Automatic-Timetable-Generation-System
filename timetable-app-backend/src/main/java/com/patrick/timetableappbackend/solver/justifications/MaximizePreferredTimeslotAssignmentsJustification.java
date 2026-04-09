package com.patrick.timetableappbackend.solver.justifications;

import ai.timefold.solver.core.api.score.stream.ConstraintJustification;
import com.patrick.timetableappbackend.model.Lesson;

public record MaximizePreferredTimeslotAssignmentsJustification(Lesson lesson, String description) implements ConstraintJustification {

    public MaximizePreferredTimeslotAssignmentsJustification(Lesson lesson) {
        this(lesson,
                "Lesson '%s' for teacher '%s' is not assigned to one of their preferred timeslots."
                        .formatted(lesson.getSubject(), lesson.getTeacher().getName()));
    }
}
