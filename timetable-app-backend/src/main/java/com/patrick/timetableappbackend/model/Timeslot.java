package com.patrick.timetableappbackend.model;

import ai.timefold.solver.core.api.domain.lookup.PlanningId;
import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import jakarta.persistence.*;
import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.Objects;
import lombok.*;
import org.hibernate.Hibernate;

@JsonIdentityInfo(
    scope = Timeslot.class,
    generator = ObjectIdGenerators.PropertyGenerator.class,
    property = "id")
@Getter
@Setter
@ToString
@Entity
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Timeslot {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id", nullable = false, updatable = false)
  @PlanningId
  private Long id;

  private DayOfWeek dayOfWeek;
  private LocalTime startTime;
  private LocalTime endTime;

  public Timeslot(long id, DayOfWeek dayOfWeek, LocalTime startTime) {
    this(id, dayOfWeek, startTime, startTime.plusMinutes(120));
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) return true;
    if (o == null || Hibernate.getClass(this) != Hibernate.getClass(o)) return false;
    Timeslot timeslot = (Timeslot) o;
    return id != null && Objects.equals(id, timeslot.id);
  }

  @Override
  public int hashCode() {
    return getClass().hashCode();
  }
}
