package com.patrick.timetableappbackend.solver.justifications;

import ai.timefold.solver.core.api.score.stream.ConstraintJustification;
import com.patrick.timetableappbackend.model.StudentGroup;

import java.time.DayOfWeek;
import java.time.LocalTime;

public record EarlyStartHighSchoolJustification(
        StudentGroup studentGroup,
        DayOfWeek dayOfWeek,
        LocalTime startTime,
        int penaltyMinutes,
        String description
) implements ConstraintJustification {

    public EarlyStartHighSchoolJustification(StudentGroup studentGroup, DayOfWeek dayOfWeek, LocalTime startTime, int penaltyMinutes) {
        this(studentGroup, dayOfWeek, startTime, penaltyMinutes,
                "Student group '%s' starts their day on %s at %s (%d minutes after 08:00)"
                        .formatted(studentGroup.getName(), dayOfWeek, startTime, penaltyMinutes));
    }
}
