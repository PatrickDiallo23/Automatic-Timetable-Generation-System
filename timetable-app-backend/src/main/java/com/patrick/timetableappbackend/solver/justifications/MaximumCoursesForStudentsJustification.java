package com.patrick.timetableappbackend.solver.justifications;

import ai.timefold.solver.core.api.score.stream.ConstraintJustification;
import com.patrick.timetableappbackend.solver.TimetableConstraintProvider.StudentDayOfWeek;

public record MaximumCoursesForStudentsJustification(StudentDayOfWeek studentDay, int totalHours, String description) implements ConstraintJustification {

    public MaximumCoursesForStudentsJustification(StudentDayOfWeek studentDay, int totalHours) {
        this(studentDay, totalHours,
                "Student group '%s' has %d hours of courses on %s, exceeding the maximum daily limit."
                        .formatted(studentDay.studentGroup().getName(), totalHours, studentDay.dayOfWeek()));
    }
}
