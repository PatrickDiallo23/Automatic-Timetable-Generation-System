package com.patrick.timetableappbackend.solver.justifications;

import ai.timefold.solver.core.api.score.stream.ConstraintJustification;
import com.patrick.timetableappbackend.model.Lesson;

public record CapacityRoomConflictJustification(Lesson lesson, String description) implements ConstraintJustification {

    public CapacityRoomConflictJustification(Lesson lesson) {
        this(lesson,
                "Room '%s' has capacity %d but lesson '%s' for student group '%s' has %d students."
                        .formatted(lesson.getRoom().getName(), lesson.getRoom().getCapacity(),
                                lesson.getSubject(), lesson.getStudentGroup().getName(),
                                lesson.getStudentGroup().getNumberOfStudents()));
    }
}
