package com.patrick.timetableappbackend.model;

import ai.timefold.solver.core.api.domain.constraintweight.ConstraintConfigurationProvider;
import ai.timefold.solver.core.api.domain.solution.PlanningEntityCollectionProperty;
import ai.timefold.solver.core.api.domain.solution.PlanningScore;
import ai.timefold.solver.core.api.domain.solution.PlanningSolution;
import ai.timefold.solver.core.api.domain.solution.ProblemFactCollectionProperty;
import ai.timefold.solver.core.api.domain.valuerange.ValueRangeProvider;
import ai.timefold.solver.core.api.score.buildin.hardmediumsoft.HardMediumSoftScore;
import ai.timefold.solver.core.api.solver.SolverStatus;
import com.patrick.timetableappbackend.solver.TimetableConstraintConfiguration;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@PlanningSolution
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Timetable {

//    private String name;

    @ProblemFactCollectionProperty
    // @ValueRangeProvider
    private List<Timeslot> timeslots;
    @ProblemFactCollectionProperty
    @ValueRangeProvider
    private List<Room> rooms;
    @PlanningEntityCollectionProperty
    private List<Lesson> lessons;

    @ConstraintConfigurationProvider
    private TimetableConstraintConfiguration timetableConstraintConfiguration;

    @PlanningScore
    private HardMediumSoftScore score;

    // Ignored by Timefold, used by the UI to display solve or stop solving button
    private SolverStatus solverStatus;

    private Long duration;

    public Timetable(HardMediumSoftScore score) {
        this.score = score;
    }

    public Timetable(HardMediumSoftScore score, SolverStatus solverStatus) {
        this.score = score;
        this.solverStatus = solverStatus;
    }

    public Timetable(List<Timeslot> timeslots, List<Room> rooms, List<Lesson> lessons) {

        this.timeslots = timeslots;
        this.rooms = rooms;
        this.lessons = lessons;
    }

    public Timetable(List<Timeslot> timeslots, List<Room> rooms, List<Lesson> lessons, TimetableConstraintConfiguration timetableConstraintConfiguration) {
        this.timeslots = timeslots;
        this.rooms = rooms;
        this.lessons = lessons;
        this.timetableConstraintConfiguration = timetableConstraintConfiguration;
    }

    public Timetable(List<Timeslot> timeslots, List<Room> rooms, List<Lesson> lessons, TimetableConstraintConfiguration timetableConstraintConfiguration, Long duration) {
        this.timeslots = timeslots;
        this.rooms = rooms;
        this.lessons = lessons;
        this.timetableConstraintConfiguration = timetableConstraintConfiguration;
        this.duration = duration;
    }
}
