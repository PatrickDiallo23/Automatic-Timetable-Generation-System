package com.patrick.timetableappbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TimeslotRequest {
    private int dayOfWeek;
    private LocalTime startTime;
    private LocalTime endTime;
}
