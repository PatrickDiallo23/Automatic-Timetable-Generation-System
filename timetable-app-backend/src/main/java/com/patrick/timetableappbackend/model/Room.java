package com.patrick.timetableappbackend.model;

import ai.timefold.solver.core.api.domain.lookup.PlanningId;
import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import jakarta.persistence.*;
import java.util.Objects;
import lombok.*;
import org.hibernate.Hibernate;

@JsonIdentityInfo(
    scope = Room.class,
    generator = ObjectIdGenerators.PropertyGenerator.class,
    property = "id")
@Getter
@Setter
@ToString
@Entity
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Room {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id", nullable = false, updatable = false)
  @PlanningId
  private Long id;

  private String name;
  private Long capacity;
  private String building;

  public Room(long id, String name) {
    this.id = id;
    this.name = name;
  }

  public Room(long id, String name, Long capacity) {
    this.id = id;
    this.name = name;
    this.capacity = capacity;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) return true;
    if (o == null || Hibernate.getClass(this) != Hibernate.getClass(o)) return false;
    Room room = (Room) o;
    return id != null && Objects.equals(id, room.id);
  }

  @Override
  public int hashCode() {
    return getClass().hashCode();
  }
}
