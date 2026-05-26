package com.patrick.timetableappbackend.solver.justifications;

import ai.timefold.solver.core.api.score.stream.ConstraintJustification;
import com.patrick.timetableappbackend.model.Room;

public record CourseStudentsGroupedInTheSameRoomJustification(Long timeslotId, Room room, String series, int studentTotal, String description) implements ConstraintJustification {
    public CourseStudentsGroupedInTheSameRoomJustification(Long timeslotId, Room room, String series, int studentTotal) {
        this(timeslotId, room, series, studentTotal,
                "Course for series '%s' (%d students) exceeds capacity of room '%s' (%d) in timeslot ID %d."
                        .formatted(series, studentTotal, room.getName(), room.getCapacity(), timeslotId));
    }
}
