package com.patrick.timetableappbackend.dto;

import java.util.Set;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class TeacherDTO {
  private Long id;
  private String name;
  private Set<TimeslotDTO> timeslots;
}
