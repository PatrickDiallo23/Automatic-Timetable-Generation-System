package com.patrick.timetableappbackend.solver.justifications;

import ai.timefold.solver.core.api.score.stream.ConstraintJustification;

public record LabsGroupedInTheSameTimeslotJustification(String groupName, String subject, int timeslotAndRoomCount, String description) implements ConstraintJustification {
    public LabsGroupedInTheSameTimeslotJustification(String groupName, String subject, int timeslotAndRoomCount) {
        this(groupName, subject, timeslotAndRoomCount,
                "Laboratories for group '%s' in subject '%s' are spread across %d different timeslots/rooms."
                        .formatted(groupName, subject, timeslotAndRoomCount));
    }
}
