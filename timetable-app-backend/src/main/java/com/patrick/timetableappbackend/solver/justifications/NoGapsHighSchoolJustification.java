package com.patrick.timetableappbackend.solver.justifications;

import ai.timefold.solver.core.api.score.stream.ConstraintJustification;
import com.patrick.timetableappbackend.model.StudentGroup;

import java.time.DayOfWeek;

public record NoGapsHighSchoolJustification(
        StudentGroup studentGroup,
        DayOfWeek dayOfWeek,
        long gapMinutes,
        String description
) implements ConstraintJustification {

    public NoGapsHighSchoolJustification(StudentGroup studentGroup, DayOfWeek dayOfWeek, long gapMinutes) {
        this(studentGroup, dayOfWeek, gapMinutes,
                "Student group '%s' has a %d-minute gap in their schedule on %s"
                        .formatted(studentGroup.getName(), gapMinutes, dayOfWeek));
    }
}
