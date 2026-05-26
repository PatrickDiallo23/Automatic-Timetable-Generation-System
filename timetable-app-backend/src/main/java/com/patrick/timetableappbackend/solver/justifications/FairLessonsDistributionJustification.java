package com.patrick.timetableappbackend.solver.justifications;

import ai.timefold.solver.core.api.score.stream.ConstraintJustification;
import com.patrick.timetableappbackend.model.StudentGroup;

import java.time.DayOfWeek;

public record FairLessonsDistributionJustification(
        StudentGroup studentGroup,
        DayOfWeek dayOfWeek,
        int lessonCount,
        String description
) implements ConstraintJustification {

    public FairLessonsDistributionJustification(StudentGroup studentGroup, DayOfWeek dayOfWeek, int lessonCount) {
        this(studentGroup, dayOfWeek, lessonCount,
                "Student group '%s' has %d lessons on %s (squared penalty: %d)"
                        .formatted(studentGroup.getName(), lessonCount, dayOfWeek, lessonCount * lessonCount));
    }
}
