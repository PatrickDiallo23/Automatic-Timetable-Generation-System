package com.patrick.timetableappbackend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Schema(description = "Request object for aggregating data from multiple directories. It contains a list of directory names to be processed.")
public class AggregationRequest {
    @Schema(description = "List of directory names to be aggregated", example = "[\"dir1\", \"dir2\", \"dir3\"]")
    private List<String> directoryNames;

}
