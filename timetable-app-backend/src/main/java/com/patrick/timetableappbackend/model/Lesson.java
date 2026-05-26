package com.patrick.timetableappbackend.model;

import ai.timefold.solver.core.api.domain.entity.PlanningEntity;
import ai.timefold.solver.core.api.domain.entity.PlanningPin;
import ai.timefold.solver.core.api.domain.lookup.PlanningId;
import ai.timefold.solver.core.api.domain.valuerange.ValueRangeProvider;
import ai.timefold.solver.core.api.domain.variable.PlanningVariable;
import com.fasterxml.jackson.annotation.JsonIdentityReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.patrick.timetableappbackend.utils.LessonStrengthComparator;
import com.patrick.timetableappbackend.utils.RoomStrengthComparator;
import com.patrick.timetableappbackend.utils.TimeslotStrengthComparator;
import jakarta.persistence.CascadeType;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Transient;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import org.hibernate.Hibernate;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@PlanningEntity(difficultyComparatorClass = LessonStrengthComparator.class)
@Getter
@Setter
@ToString(exclude = {"timetable"})
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

    @PlanningPin
    @Builder.Default
    private boolean pinned = false;

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

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "lesson_applied_rule_ids", joinColumns = @JoinColumn(name = "lesson_id"))
    @Column(name = "rule_id")
    @Builder.Default
    private List<Long> appliedRuleIds = new ArrayList<>();

    @JsonIgnore
    @Transient
    @Builder.Default
    private List<RestrictionRule> appliedRules = new ArrayList<>();

    @JsonIgnore
    @Transient
    private Timetable timetable;

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

    @ValueRangeProvider
    @JsonIgnore
    public List<Room> getPossibleRooms() {
        if (timetable == null || timetable.getRooms() == null) {
            return List.of();
        }
        List<RestrictionRule> roomRules = getActiveRulesForTarget(RuleTargetType.ROOM);
        if (roomRules.isEmpty()) {
            return timetable.getRooms();
        }
        return timetable.getRooms().stream()
                .filter(room -> roomRules.stream().anyMatch(rule -> rule.matches(room)))
                .toList();
    }

    @ValueRangeProvider
    @JsonIgnore
    public List<Timeslot> getPossibleTimeslots() {
        if (timetable == null || timetable.getTimeslots() == null) {
            return List.of();
        }
        List<Timeslot> durationFiltered = timetable.getTimeslots().stream()
                .filter(this::matchesDuration)
                .toList();
        List<RestrictionRule> timeslotRules = getActiveRulesForTarget(RuleTargetType.TIMESLOT);
        if (timeslotRules.isEmpty()) {
            return durationFiltered;
        }
        return durationFiltered.stream()
                .filter(ts -> timeslotRules.stream().anyMatch(rule -> rule.matches(ts)))
                .toList();
    }

    private boolean matchesDuration(Timeslot timeslot) {
        var timeslotDuration = Duration.between(timeslot.getStartTime(), timeslot.getEndTime());
        return (timeslotDuration.abs().toHours() == duration);
    }

    private List<RestrictionRule> getActiveRulesForTarget(RuleTargetType targetType) {
        if (appliedRules == null || appliedRules.isEmpty()) {
            return List.of();
        }
        return appliedRules.stream()
                .filter(RestrictionRule::isActive)
                .filter(rule -> rule.getTargetType() == targetType)
                .toList();
    }
}
