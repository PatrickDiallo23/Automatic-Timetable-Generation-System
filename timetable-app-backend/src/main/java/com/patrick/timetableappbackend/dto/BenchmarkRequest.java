package com.patrick.timetableappbackend.dto;

import com.patrick.timetableappbackend.model.Timetable;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "Request object for benchmarking the timetable solution. It contains the source of the timetable data and the timetable itself.")
public class BenchmarkRequest {
    @Schema(description = "Source of the timetable data, either 'imported' or 'database'", example = "imported")
    private String source;
    @Schema(description = "The timetable object containing the solution to be benchmarked")
    private Timetable timetable;
}