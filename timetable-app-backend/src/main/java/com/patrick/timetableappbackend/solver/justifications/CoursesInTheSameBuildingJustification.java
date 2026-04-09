package com.patrick.timetableappbackend.solver.justifications;

import ai.timefold.solver.core.api.score.stream.ConstraintJustification;
import com.patrick.timetableappbackend.model.Lesson;

public record CoursesInTheSameBuildingJustification(Lesson lesson1, Lesson lesson2, String description) implements ConstraintJustification {
    public CoursesInTheSameBuildingJustification(Lesson lesson1, Lesson lesson2) {
        this(lesson1, lesson2,
                "Lessons '%s' and '%s' for student group '%s' are consecutively scheduled in the same building."
                        .formatted(lesson1.getSubject(), lesson2.getSubject(), lesson1.getStudentGroup().getName()));
    }
}
