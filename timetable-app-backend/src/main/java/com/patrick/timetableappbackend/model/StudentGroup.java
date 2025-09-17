package com.patrick.timetableappbackend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import org.hibernate.Hibernate;

import java.util.Objects;

@Getter
@Setter
@ToString
@Entity
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class StudentGroup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false, updatable = false)
    private Long id;
    @Enumerated(EnumType.STRING)
    private Year year;
    private String name;
    private String studentGroup;
    @Enumerated(EnumType.STRING)
    private SemiGroup semiGroup;
    private Long numberOfStudents;

    public StudentGroup(Long id, String name, Long numberOfStudents) {
        this.id = id;
        this.name = name;
        this.numberOfStudents = numberOfStudents;
    }

    public StudentGroup(Long id, Year year, String name, String group, Long numberOfStudents) {
        this.id = id;
        this.year = year;
        this.name = name;
        this.studentGroup = group;
        this.numberOfStudents = numberOfStudents;
    }

    //should I add a @OneToMany/@ManyToMany relationship with Lessons and make it optional?

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || Hibernate.getClass(this) != Hibernate.getClass(o)) return false;
        StudentGroup that = (StudentGroup) o;
        return id != null && Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
