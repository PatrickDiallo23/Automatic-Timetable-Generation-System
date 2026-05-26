package com.patrick.timetableappbackend.solver.justifications;

import ai.timefold.solver.core.api.score.stream.ConstraintJustification;

public record SeminarsGroupedInTheSameTimeslotJustification(String groupName, String subject, int timeslotAndRoomCount, String description) implements ConstraintJustification {
    public SeminarsGroupedInTheSameTimeslotJustification(String groupName, String subject, int timeslotAndRoomCount) {
        this(groupName, subject, timeslotAndRoomCount,
                "Seminars for group '%s' in subject '%s' are spread across %d different timeslots/rooms."
                        .formatted(groupName, subject, timeslotAndRoomCount));
    }
}
