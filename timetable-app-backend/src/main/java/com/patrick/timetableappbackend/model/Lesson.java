package com.patrick.timetableappbackend.model;

import ai.timefold.solver.core.api.domain.entity.PlanningEntity;
import ai.timefold.solver.core.api.domain.entity.PlanningPin;
import ai.timefold.solver.core.api.domain.lookup.PlanningId;
import ai.timefold.solver.core.api.domain.valuerange.ValueRangeProvider;
import ai.timefold.solver.core.api.domain.variable.PlanningVariable;
import com.fasterxml.jackson.annotation.JsonIdentityReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.patrick.timetableappbackend.service.RuleEvaluator;
import com.patrick.timetableappbackend.utils.LessonStrengthComparator;
import com.patrick.timetableappbackend.utils.RoomStrengthComparator;
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
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
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

    // --- Rule-based restrictions ---

    @OneToMany(mappedBy = "lesson", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonIgnore
    @Builder.Default
    private Set<LessonRestrictionRule> restrictionRules = new HashSet<>();

    /** How to combine multiple room rules: AND (intersection) or OR (union). Default AND. */
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private RuleCombination roomRuleCombination = RuleCombination.AND;

    /** How to combine multiple timeslot rules: AND (intersection) or OR (union). Default AND. */
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private RuleCombination timeslotRuleCombination = RuleCombination.AND;

    // --- JSON property methods ---

    @JsonProperty("hasRestrictions")
    public boolean getHasRestrictions() {
        return restrictionRules != null && !restrictionRules.isEmpty();
    }

    @JsonProperty("appliedRuleIds")
    public List<Long> getAppliedRuleIds() {
        if (restrictionRules == null || restrictionRules.isEmpty()) {
            return new ArrayList<>();
        }
        return restrictionRules.stream()
            .map(lr -> lr.getRule().getId())
            .toList();
    }

    @JsonIgnore
    @Transient
    private Timetable timetable;

    // --- Constructors ---

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

    // --- ValueRangeProvider methods ---

    /**
     * Returns the list of rooms available for this lesson.
     * If restriction rules exist for rooms, evaluates them using AND/OR logic.
     * Otherwise, all rooms from the timetable are available.
     */
    @ValueRangeProvider
    public List<Room> getPossibleRooms() {
        if (this.timetable == null || this.timetable.getRooms() == null) {
            return List.of();
        }
        List<RestrictionRule> roomRules = getRulesForTarget(RuleTargetType.ROOM);
        if (roomRules.isEmpty()) {
            return this.timetable.getRooms();
        }
        return this.timetable.getRooms().stream()
            .filter(room -> evaluateRules(roomRules, room, roomRuleCombination))
            .toList();
    }

    /**
     * Returns the list of timeslots available for this lesson.
     * Duration matching is ALWAYS applied (mandatory).
     * If restriction rules exist for timeslots, evaluates them using AND/OR logic
     * on top of the duration filter.
     */
    @ValueRangeProvider
    public List<Timeslot> getPossibleTimeslots() {
        if (this.timetable == null || this.timetable.getTimeslots() == null) {
            return List.of();
        }
        List<RestrictionRule> timeslotRules = getRulesForTarget(RuleTargetType.TIMESLOT);
        if (timeslotRules.isEmpty()) {
            // No rules — filter only by duration
            return this.timetable.getTimeslots().stream()
                .filter(this::matchesDuration)
                .toList();
        }
        // Apply rules AND mandatory duration matching
        return this.timetable.getTimeslots().stream()
            .filter(ts -> evaluateRules(timeslotRules, ts, timeslotRuleCombination))
            .filter(this::matchesDuration)
            .toList();
    }

    private boolean matchesDuration(Timeslot timeslot) {
        var timeslotDuration = Duration.between(timeslot.getStartTime(), timeslot.getEndTime());
        return (timeslotDuration.abs().toHours() == duration);
    }

    private List<RestrictionRule> getRulesForTarget(RuleTargetType targetType) {
        if (restrictionRules == null || restrictionRules.isEmpty()) {
            return List.of();
        }
        return restrictionRules.stream()
            .map(LessonRestrictionRule::getRule)
            .filter(rule -> rule.getTargetType() == targetType)
            .toList();
    }

    private boolean evaluateRules(List<RestrictionRule> rules, Room room, RuleCombination combination) {
        if (combination == RuleCombination.OR) {
            return rules.stream().anyMatch(rule -> RuleEvaluator.matchesRoom(rule, room));
        }
        // AND (default)
        return rules.stream().allMatch(rule -> RuleEvaluator.matchesRoom(rule, room));
    }

    private boolean evaluateRules(List<RestrictionRule> rules, Timeslot timeslot, RuleCombination combination) {
        if (combination == RuleCombination.OR) {
            return rules.stream().anyMatch(rule -> RuleEvaluator.matchesTimeslot(rule, timeslot));
        }
        // AND (default)
        return rules.stream().allMatch(rule -> RuleEvaluator.matchesTimeslot(rule, timeslot));
    }

    // --- Helper methods for managing restriction rules ---

    public void addRestrictionRule(RestrictionRule rule) {
        if (this.restrictionRules == null) {
            this.restrictionRules = new HashSet<>();
        }
        this.restrictionRules.add(new LessonRestrictionRule(this, rule));
    }

    public void clearRestrictionRules() {
        if (this.restrictionRules != null) {
            this.restrictionRules.clear();
        }
    }
}
