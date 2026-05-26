package com.patrick.timetableappbackend.solver.justifications;

import ai.timefold.solver.core.api.score.stream.ConstraintJustification;
import com.patrick.timetableappbackend.solver.TimetableConstraintProvider.TeacherDayOfWeek;

public record MaximumCoursesTeachedJustification(TeacherDayOfWeek teacherDay, int totalHours, String description) implements ConstraintJustification {

    public MaximumCoursesTeachedJustification(TeacherDayOfWeek teacherDay, int totalHours) {
        this(teacherDay, totalHours,
                "Teacher '%s' teaches %d hours on %s, exceeding the daily maximum limit."
                        .formatted(teacherDay.teacher().getName(), totalHours, teacherDay.dayOfWeek()));
    }
}
