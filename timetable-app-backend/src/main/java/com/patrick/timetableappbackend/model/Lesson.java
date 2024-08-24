package com.patrick.timetableappbackend.model;

import ai.timefold.solver.core.api.domain.entity.PlanningEntity;
import ai.timefold.solver.core.api.domain.lookup.PlanningId;
import ai.timefold.solver.core.api.domain.variable.PlanningVariable;
import com.fasterxml.jackson.annotation.JsonIdentityReference;
import com.patrick.timetableappbackend.utils.LessonStrengthComparator;
import com.patrick.timetableappbackend.utils.RoomStrengthComparator;
import com.patrick.timetableappbackend.utils.TimeslotStrengthComparator;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.Hibernate;

import java.util.Objects;

@PlanningEntity(difficultyComparatorClass = LessonStrengthComparator.class)
@Getter
@Setter
@ToString
@Entity
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Lesson {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false, unique = true, updatable = false)
    @PlanningId
    private Long id;

    private String subject;

    @ManyToOne(cascade = {CascadeType.MERGE})
    @JoinColumn(name = "teacher_id")
    private Teacher teacher;

    @ManyToOne(cascade = {CascadeType.MERGE})
    @JoinColumn(name = "student_group_id")
    private StudentGroup studentGroup;

    @Enumerated(EnumType.STRING)
    private LessonType lessonType;

    @Enumerated(EnumType.STRING)
    private Year year;

    private int duration;

    @JsonIdentityReference
    @ManyToOne() // cascade = CascadeType.MERGE
    @JoinColumn(name = "timeslot_id")
    @PlanningVariable(strengthComparatorClass = TimeslotStrengthComparator.class)
    private Timeslot timeslot;

    @JsonIdentityReference
    @ManyToOne() //cascade = CascadeType.MERGE
    @JoinColumn(name = "room_id")
    @PlanningVariable(strengthComparatorClass = RoomStrengthComparator.class)
    private Room room;

    public Lesson(long id, String subject, StudentGroup studentGroup){
        this.id = id;
        this.subject = subject;
        this.studentGroup = studentGroup;
    }

    public Lesson(long id, String subject, Teacher teacher, StudentGroup studentGroup) {
        this.id = id;
        this.subject = subject;
        this.teacher = teacher;
        this.studentGroup = studentGroup;
    }

    public Lesson(long id, String subject, Teacher teacher, StudentGroup studentGroup, LessonType type) {
        this.id = id;
        this.subject = subject;
        this.teacher = teacher;
        this.studentGroup = studentGroup;
        this.lessonType = type;
    }

    public Lesson(long id, String subject, Teacher teacher, StudentGroup studentGroup, LessonType type, Year year) {
        this.id = id;
        this.subject = subject;
        this.teacher = teacher;
        this.studentGroup = studentGroup;
        this.lessonType = type;
        this.year = year;
    }

    public Lesson(long id, String subject, Teacher teacher, StudentGroup studentGroup, LessonType type, Year year, int duration) {
        this.id = id;
        this.subject = subject;
        this.teacher = teacher;
        this.studentGroup = studentGroup;
        this.lessonType = type;
        this.year = year;
        this.duration = duration;
    }


    public Lesson(long id, String subject, Teacher teacher, StudentGroup studentGroup, Timeslot timeslot, Room room) {
        this.id = id;
        this.subject = subject;
        this.teacher = teacher;
        this.studentGroup = studentGroup;
        this.timeslot = timeslot;
        this.room = room;
    }

    public Lesson(long id, String subject, Teacher teacher, StudentGroup studentGroup, int duration, Timeslot timeslot, Room room) {
        this.id = id;
        this.subject = subject;
        this.teacher = teacher;
        this.studentGroup = studentGroup;
        this.duration = duration;
        this.timeslot = timeslot;
        this.room = room;
    }

    public Lesson(long id, String subject, LessonType lessonType, Teacher teacher, StudentGroup studentGroup, Timeslot timeslot, Room room) {
        this.id = id;
        this.subject = subject;
        this.lessonType = lessonType;
        this.teacher = teacher;
        this.studentGroup = studentGroup;
        this.timeslot = timeslot;
        this.room = room;
    }

    public Lesson(long id, String subject, LessonType lessonType, Teacher teacher, StudentGroup studentGroup, int duration, Timeslot timeslot, Room room) {
        this.id = id;
        this.subject = subject;
        this.lessonType = lessonType;
        this.teacher = teacher;
        this.studentGroup = studentGroup;
        this.duration = duration;
        this.timeslot = timeslot;
        this.room = room;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || Hibernate.getClass(this) != Hibernate.getClass(o)) return false;
        Lesson lesson = (Lesson) o;
        return id != null && Objects.equals(id, lesson.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, subject, teacher, studentGroup, lessonType, year, duration);
    }
}
