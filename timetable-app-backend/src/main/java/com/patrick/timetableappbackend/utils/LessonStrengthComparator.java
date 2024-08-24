package com.patrick.timetableappbackend.utils;

import com.patrick.timetableappbackend.model.Lesson;
import org.apache.commons.lang3.builder.CompareToBuilder;

import java.util.Comparator;

public class LessonStrengthComparator implements Comparator<Lesson> {
    @Override
    public int compare(Lesson o1, Lesson o2) {
        return new CompareToBuilder()
                .append(o1.getDuration(),o2.getDuration())
                .append(o1.getId(),o2.getId())
                .toComparison();
    }
}
