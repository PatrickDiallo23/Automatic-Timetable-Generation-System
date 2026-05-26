package com.patrick.timetableappbackend.solver.justifications;

import ai.timefold.solver.core.api.score.stream.ConstraintJustification;
import com.patrick.timetableappbackend.model.Lesson;

public record ForeignLanguageSameTimeslotJustification(
        Lesson lesson1,
        Lesson lesson2,
        String description
) implements ConstraintJustification {

    public ForeignLanguageSameTimeslotJustification(Lesson lesson1, Lesson lesson2) {
        this(lesson1, lesson2,
                "Foreign language lessons '%s' (group '%s', year %s) and '%s' (group '%s', year %s) are in different timeslots"
                        .formatted(
                                lesson1.getSubject(),
                                lesson1.getStudentGroup().getName(),
                                lesson1.getStudentGroup().getYear(),
                                lesson2.getSubject(),
                                lesson2.getStudentGroup().getName(),
                                lesson2.getStudentGroup().getYear()));
    }
}
