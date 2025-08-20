package com.patrick.timetableappbackend.utils;

import ai.timefold.solver.core.api.score.director.ScoreDirector;
import ai.timefold.solver.core.impl.heuristic.selector.common.decorator.SelectionFilter;
import ai.timefold.solver.core.impl.heuristic.selector.move.generic.ChangeMove;
import com.patrick.timetableappbackend.model.Lesson;
import com.patrick.timetableappbackend.model.Room;
import com.patrick.timetableappbackend.model.Timetable;

import java.time.Duration;

public class SportLessonChangeMoveFilter implements SelectionFilter<Timetable, ChangeMove<Lesson>> {

    @Override
    public boolean accept(ScoreDirector<Timetable> scoreDirector, ChangeMove<Lesson> changeMove) {
        Lesson lesson = (Lesson) changeMove.getEntity();
        Object planningValue = changeMove.getToPlanningValue();

        // Ensure the value is of type Timeslot
        if (!(planningValue instanceof Room)) {
            return true; // Accept the move if the target value is not a Timeslot
        }
        Room toRoom = (Room) planningValue;
        return isSportRoom(lesson, toRoom);
    }

    private boolean isSportRoom(Lesson lesson, Room toRoom) {
        if (lesson.getSubject().toLowerCase().contains("Sport".toLowerCase()) ||
            lesson.getSubject().toLowerCase().contains("Educatie Fizica".toLowerCase()) ||
            lesson.getSubject().toLowerCase().contains("Educație Fizică".toLowerCase()) ||
            lesson.getSubject().toLowerCase().contains("Physical Education".toLowerCase()) ||
            lesson.getSubject().toLowerCase().contains("PE".toLowerCase())) {
            return toRoom.getName().toLowerCase().contains("Sala de Sport".toLowerCase()) ||
                    toRoom.getName().toLowerCase().contains("Gym".toLowerCase()) ||
                    toRoom.getName().toLowerCase().contains("Sports Hall".toLowerCase());
        }
        else {
            return true; // allow normal lessons in any room
        }
    }

}
