package com.patrick.timetableappbackend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.DayOfWeek;
import java.time.LocalTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Schema(description = "Data Transfer Object for Teacher preferred Timeslot entity, containing day of the week, start time, and end time.")
public class TeacherTimeslotDTO {
    @Schema(description = "Day of the week for the timeslot", example = "MONDAY")
    private DayOfWeek dayOfWeek;
    @Schema(description = "Start time of the timeslot", example = "08:00")
    private LocalTime startTime;
    @Schema(description = "End time of the timeslot", example = "10:00")
    private LocalTime endTime;
}