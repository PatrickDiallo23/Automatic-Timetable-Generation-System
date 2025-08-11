package com.patrick.timetableappbackend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Schema(description = "Data Transfer Object for Teacher entity, containing ID, name, and associated timeslots.")
public class TeacherDTO {
    @Schema(description = "Unique identifier for the teacher", example = "1")
    private Long id;
    @Schema(description = "Name of the teacher", example = "John Doe")
    private String name;
    @Schema(description = "Set of preferred timeslots associated with the teacher")
    private Set<TeacherTimeslotDTO> preferredTimeslots;
}
