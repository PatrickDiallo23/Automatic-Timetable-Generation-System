package com.patrick.timetableappbackend.model;

import ai.timefold.solver.core.api.domain.entity.PlanningEntity;
import ai.timefold.solver.core.api.domain.entity.PlanningPin;
import ai.timefold.solver.core.api.domain.lookup.PlanningId;
import ai.timefold.solver.core.api.domain.valuerange.ValueRangeProvider;
import ai.timefold.solver.core.api.domain.variable.PlanningVariable;
import com.fasterxml.jackson.annotation.JsonIdentityReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.patrick.timetableappbackend.utils.LessonStrengthComparator;
import com.patrick.timetableappbackend.utils.RoomStrengthComparator;
import com.patrick.timetableappbackend.utils.RuleEvaluator;
import com.patrick.timetableappbackend.utils.TimeslotStrengthComparator;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
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
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;

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

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "lesson_restriction_rules",
            joinColumns = @JoinColumn(name = "lesson_id"),
            inverseJoinColumns = @JoinColumn(name = "rule_id")
    )
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    @Builder.Default
    private Set<RestrictionRule> restrictionRules = new HashSet<>();

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private RuleCombination roomRuleCombination = RuleCombination.AND;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private RuleCombination timeslotRuleCombination = RuleCombination.AND;

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
        if (this.timetable == null || this.timetable.getRooms() == null) {
            return new ArrayList<>(List.of());
        }
        List<Room> allRooms = this.timetable.getRooms();
        if (restrictionRules == null || restrictionRules.isEmpty()) {
            return allRooms;
        }
        return RuleEvaluator.filterRooms(allRooms, restrictionRules, roomRuleCombination);
    }

    @ValueRangeProvider
    @JsonIgnore
    public List<Timeslot> getPossibleTimeslots() {
        if (this.timetable == null || this.timetable.getTimeslots() == null) {
            return new ArrayList<>(List.of());
        }
        // Always apply mandatory duration matching first
        List<Timeslot> durationMatched = this.timetable.getTimeslots().stream()
                .filter(this::matchesTimeslot)
                .toList();

        // Then apply timeslot restriction rules if any
        if (restrictionRules == null || restrictionRules.isEmpty()) {
            return durationMatched;
        }
        return RuleEvaluator.filterTimeslots(durationMatched, restrictionRules, timeslotRuleCombination);
    }

    private boolean matchesTimeslot(Timeslot timeslot) {
        var timeslotDuration = Duration.between(timeslot.getStartTime(), timeslot.getEndTime());
        return (timeslotDuration.abs().toHours() == duration);
    }

    @JsonProperty("hasRestrictions")
    public boolean hasRestrictions() {
        return restrictionRules != null && !restrictionRules.isEmpty();
    }

    @JsonProperty("appliedRuleIds")
    public Set<Long> getAppliedRuleIds() {
        if (restrictionRules == null) {
            return Set.of();
        }
        return restrictionRules.stream()
                .map(RestrictionRule::getId)
                .collect(java.util.stream.Collectors.toSet());
    }
}
