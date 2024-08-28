package com.patrick.timetableappbackend.model;

import com.fasterxml.jackson.annotation.JsonIdentityReference;
import jakarta.persistence.*;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;
import lombok.*;
import org.hibernate.Hibernate;

@Getter
@Setter
@ToString
@Entity
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Teacher {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id", nullable = false, updatable = false)
  private Long id;

  private String name;

  @JsonIdentityReference
  @ManyToMany()
  @JoinTable(
      name = "teacher_timeslot",
      joinColumns = @JoinColumn(name = "teacher_id", referencedColumnName = "id"),
      inverseJoinColumns = @JoinColumn(name = "timeslot_id", referencedColumnName = "id"))
  @ToString.Exclude
  private Set<Timeslot> timeslots = new HashSet<>(); // teacher preffered Timeslots

  // todo: replace timeslots with periods (9AM to 4PM)

  // should I add a @OneToMany/@ManyToMany relationship with Lessons and make it optional?

  @Override
  public boolean equals(Object o) {
    if (this == o) return true;
    if (o == null || Hibernate.getClass(this) != Hibernate.getClass(o)) return false;
    Teacher teacher = (Teacher) o;
    return id != null && Objects.equals(id, teacher.id);
  }

  @Override
  public int hashCode() {
    return getClass().hashCode();
  }
}
