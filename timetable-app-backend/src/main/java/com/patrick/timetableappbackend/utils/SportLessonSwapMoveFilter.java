package com.patrick.timetableappbackend.utils;

import ai.timefold.solver.core.api.score.director.ScoreDirector;
import ai.timefold.solver.core.impl.heuristic.selector.common.decorator.SelectionFilter;
import ai.timefold.solver.core.impl.heuristic.selector.move.generic.SwapMove;
import com.patrick.timetableappbackend.model.Lesson;
import com.patrick.timetableappbackend.model.Timeslot;
import com.patrick.timetableappbackend.model.Timetable;

import java.time.Duration;

public class SportLessonSwapMoveFilter implements SelectionFilter<Timetable, SwapMove> {

    @Override
    public boolean accept(ScoreDirector<Timetable> scoreDirector, SwapMove swapMove) {
        Lesson leftLesson = (Lesson) swapMove.getLeftEntity();
        Lesson rightLesson = (Lesson) swapMove.getRightEntity();

        return isSportMatching(leftLesson, rightLesson);
    }

    private boolean isSportMatching(Lesson leftLesson, Lesson rightLesson) {
        boolean isSportLesson1 = leftLesson.getSubject().toLowerCase().contains("Sport".toLowerCase()) ||
                leftLesson.getSubject().toLowerCase().contains("Educatie Fizica".toLowerCase()) ||
                leftLesson.getSubject().toLowerCase().contains("Educație Fizică".toLowerCase()) ||
                leftLesson.getSubject().toLowerCase().contains("Physical Education".toLowerCase()) ||
                leftLesson.getSubject().toLowerCase().contains("PE".toLowerCase());

        boolean isSportLesson2 = rightLesson.getSubject().toLowerCase().contains("Sport".toLowerCase()) ||
                rightLesson.getSubject().toLowerCase().contains("Educatie Fizica".toLowerCase()) ||
                rightLesson.getSubject().toLowerCase().contains("Educație Fizică".toLowerCase()) ||
                rightLesson.getSubject().toLowerCase().contains("Physical Education".toLowerCase()) ||
                rightLesson.getSubject().toLowerCase().contains("PE".toLowerCase());

        boolean isSportRoomLesson1 = leftLesson.getRoom().getName().toLowerCase().contains("Sala de Sport".toLowerCase()) ||
                leftLesson.getRoom().getName().toLowerCase().contains("Gym".toLowerCase()) ||
                leftLesson.getRoom().getName().toLowerCase().contains("Sports Hall".toLowerCase());

        boolean isSportRoomLesson2 = rightLesson.getRoom().getName().toLowerCase().contains("Sala de Sport".toLowerCase()) ||
                rightLesson.getRoom().getName().toLowerCase().contains("Gym".toLowerCase()) ||
                rightLesson.getRoom().getName().toLowerCase().contains("Sports Hall".toLowerCase());

        return (isSportLesson1 && isSportRoomLesson2) || (isSportLesson2 && isSportRoomLesson1);
    }

}
