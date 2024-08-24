package com.patrick.timetableappbackend.utils;

import com.patrick.timetableappbackend.model.Room;
import org.apache.commons.lang3.builder.CompareToBuilder;

import java.util.Comparator;

public class RoomStrengthComparator implements Comparator<Room> {

    @Override
    public int compare(Room o1, Room o2) {
        return new CompareToBuilder()
                .append(o1.getCapacity(),o2.getCapacity())
                .append(o1.getId(),o2.getId())
                .toComparison();

    }
}
