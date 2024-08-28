package com.patrick.timetableappbackend.utils;

import com.patrick.timetableappbackend.model.Timeslot;
import java.time.Duration;
import java.util.Comparator;
import org.apache.commons.lang3.builder.CompareToBuilder;

public class TimeslotStrengthComparator implements Comparator<Timeslot> {
  @Override
  public int compare(Timeslot o1, Timeslot o2) {
    return new CompareToBuilder()
        .append(calculateTimeslotDuration(o1), calculateTimeslotDuration(o2))
        .append(o1.getId(), o2.getId())
        .toComparison(); // or return 0 if we don't have any differences
  }

  private int calculateTimeslotDuration(Timeslot timeslot) {
    Duration duration = Duration.between(timeslot.getStartTime(), timeslot.getEndTime());
    return (int) duration.abs().toHours();
  }
}
