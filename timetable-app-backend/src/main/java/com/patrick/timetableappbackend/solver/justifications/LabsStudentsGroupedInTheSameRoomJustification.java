package com.patrick.timetableappbackend.solver.justifications;

import ai.timefold.solver.core.api.score.stream.ConstraintJustification;
import com.patrick.timetableappbackend.model.Room;

public record LabsStudentsGroupedInTheSameRoomJustification(Long timeslotId, Room room, String series, int studentTotal, String description) implements ConstraintJustification {
    public LabsStudentsGroupedInTheSameRoomJustification(Long timeslotId, Room room, String series, int studentTotal) {
        this(timeslotId, room, series, studentTotal,
                "Laboratory for series '%s' (%d students) exceeds capacity of room '%s' (%d) in timeslot ID %d."
                        .formatted(series, studentTotal, room.getName(), room.getCapacity(), timeslotId));
    }
}
