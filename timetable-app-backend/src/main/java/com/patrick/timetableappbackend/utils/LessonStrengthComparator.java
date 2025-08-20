package com.patrick.timetableappbackend.utils;

import com.patrick.timetableappbackend.model.Lesson;
import com.patrick.timetableappbackend.model.LessonType;
import org.apache.commons.lang3.builder.CompareToBuilder;

import java.util.Comparator;
import java.util.HashMap;
import java.util.Map;

public class LessonStrengthComparator implements Comparator<Lesson> {

    // Define lesson type order (smaller value = higher priority)
    private static final Map<LessonType, Integer> lessonTypeOrder = new HashMap<>();
    static {
        lessonTypeOrder.put(LessonType.PROJECT, 1);
        lessonTypeOrder.put(LessonType.LABORATORY, 2);
        lessonTypeOrder.put(LessonType.SEMINAR, 3);
        lessonTypeOrder.put(LessonType.COURSE, 4);
    }

    @Override
    public int compare(Lesson o1, Lesson o2) {
        int type1 = lessonTypeOrder.getOrDefault(o1.getLessonType(), Integer.MAX_VALUE);
        int type2 = lessonTypeOrder.getOrDefault(o2.getLessonType(), Integer.MAX_VALUE);

        int preferredTimeslots1 = o1.getTeacher().getPreferredTimeslots().size();
        int preferredTimeslots2 = o2.getTeacher().getPreferredTimeslots().size();

        int studentsCount1 = o1.getStudentGroup().getNumberOfStudents().intValue();
        int studentsCount2 = o2.getStudentGroup().getNumberOfStudents().intValue();

        return new CompareToBuilder()
                .append(o1.getDuration(),o2.getDuration()) // Lesson Duration priority
                .append(type1, type2)                          // Lesson Type priority
                .append(preferredTimeslots1, preferredTimeslots2) // More preferred timeslots first
                .append(studentsCount1, studentsCount2)       // More students first
                .append(o1.getId(), o2.getId())               // Tie-breaker: ID
                .toComparison();
    }
}
