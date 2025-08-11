package com.patrick.timetableappbackend.model;

import lombok.*;
import jakarta.persistence.Embeddable;
import java.time.DayOfWeek;
import java.time.LocalTime;

@Embeddable
@Getter
@Setter
@ToString
@Builder
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode
public class TeacherTimeslot {
    private DayOfWeek dayOfWeek;
    private LocalTime startTime;
    private LocalTime endTime;

    public TeacherTimeslot(DayOfWeek dayOfWeek, LocalTime startTime) {
        this(dayOfWeek, startTime, startTime.plusMinutes(120));
    }
}