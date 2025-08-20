package com.patrick.timetableappbackend.solver.justifications;

import ai.timefold.solver.core.api.score.stream.ConstraintJustification;
import com.patrick.timetableappbackend.model.Lesson;
import com.patrick.timetableappbackend.model.StudentGroup;

import java.util.List;

public record StudentGroupConflictJustificationWithList(
        String studentGroup,
        List<Lesson> conflictingLessons,
        String description
) implements ConstraintJustification {

    public StudentGroupConflictJustificationWithList(StudentGroup studentGroup, List<Lesson> lessons) {
        this(studentGroup.getName(), lessons,
                "Student group '%s' has conflicting lessons at '%s %s': %s"
                        .formatted(
                                studentGroup.getName(),
                                lessons.get(0).getTimeslot().getDayOfWeek(),
                                lessons.get(0).getTimeslot().getStartTime(),
                                lessons.stream()
                                        .map(l -> l.getSubject())
                                        .toList()
                        ));
    }

    public StudentGroupConflictJustificationWithList(long studentGroupId, List<Lesson> lessons) {
        this(String.valueOf(studentGroupId), lessons,
                "Student group '%s' has conflicting lessons at '%s %s': %s"
                        .formatted(
                                studentGroupId,
                                lessons.get(0).getTimeslot().getDayOfWeek(),
                                lessons.get(0).getTimeslot().getStartTime(),
                                lessons.stream()
                                        .map(Lesson::getSubject)
                                        .toList()
                        ));
    }
}

