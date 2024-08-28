package com.patrick.timetableappbackend.dto;

import java.time.LocalTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TimeslotRequest {
  private int dayOfWeek;
  private LocalTime startTime;
  private LocalTime endTime;
}
