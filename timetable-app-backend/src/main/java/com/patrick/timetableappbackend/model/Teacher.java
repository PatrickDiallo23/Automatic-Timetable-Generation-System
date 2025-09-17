package com.patrick.timetableappbackend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import org.hibernate.Hibernate;

import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

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
    // Preferred timeslots that belong only to this teacher
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
            name = "teacher_preferred_timeslots",
            joinColumns = @JoinColumn(name = "teacher_id")
    )
    @Builder.Default
    @ToString.Exclude
    private Set<TeacherTimeslot> preferredTimeslots = new HashSet<>();

    //should I add a @OneToMany/@ManyToMany relationship with Lessons and make it optional?

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

    //  Helper method to get all timeslots (both types)
    @JsonIgnore
    public Set<Object> getAllTimeslots() {
        Set<Object> allTimeslots = new HashSet<>();
        allTimeslots.addAll(this.preferredTimeslots);
        return allTimeslots;
    }

    // Helper method to check if teacher has any custom timeslots
    @JsonIgnore
    public boolean hasPreferredTimeslots() {
        return preferredTimeslots != null && !preferredTimeslots.isEmpty();
    }
}
