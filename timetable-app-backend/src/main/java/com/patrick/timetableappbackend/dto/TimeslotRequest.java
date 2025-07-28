package com.patrick.timetableappbackend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "Request object for creating or updating a timeslot, containing day of the week, start time, and end time.")
public class TimeslotRequest {
    @Schema(description = "Day of the week for the timeslot", example = "MONDAY", allowableValues = "MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY")
    private int dayOfWeek;
    @Schema(description = "Start time of the timeslot", example = "08:00")
    private LocalTime startTime;
    @Schema(description = "End time of the timeslot", example = "10:00")
    private LocalTime endTime;
}
