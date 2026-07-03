package com.patrick.timetableappbackend.solver;

import ai.timefold.solver.core.api.score.HardMediumSoftScore;
import ai.timefold.solver.core.api.score.stream.Constraint;
import ai.timefold.solver.core.api.score.stream.ConstraintFactory;
import ai.timefold.solver.core.api.score.stream.ConstraintProvider;
import ai.timefold.solver.core.api.score.stream.Joiners;
import com.patrick.timetableappbackend.model.Lesson;
import com.patrick.timetableappbackend.model.LessonType;
import com.patrick.timetableappbackend.model.Room;
import com.patrick.timetableappbackend.model.StudentGroup;
import com.patrick.timetableappbackend.model.Teacher;
import com.patrick.timetableappbackend.model.TeacherTimeslot;
import com.patrick.timetableappbackend.model.Timeslot;

import com.patrick.timetableappbackend.solver.justifications.ForeignLanguageSameTimeslotJustification;
import com.patrick.timetableappbackend.solver.justifications.RoomConflictJustification;
import com.patrick.timetableappbackend.solver.justifications.StudentGroupSubjectVarietyJustification;
import com.patrick.timetableappbackend.solver.justifications.StudentGroupConflictJustification;
import com.patrick.timetableappbackend.solver.justifications.StudentGroupConflictJustificationWithList;
import com.patrick.timetableappbackend.solver.justifications.TeacherConflictJustification;
import com.patrick.timetableappbackend.solver.justifications.TeacherRoomStabilityJustification;
import com.patrick.timetableappbackend.solver.justifications.TeacherTimeEfficiencyJustification;
import com.patrick.timetableappbackend.solver.justifications.NoGapsHighSchoolJustification;
import com.patrick.timetableappbackend.solver.justifications.FairLessonsDistributionJustification;
import com.patrick.timetableappbackend.solver.justifications.EarlyStartHighSchoolJustification;
import com.patrick.timetableappbackend.solver.justifications.CapacityRoomConflictJustification;
import com.patrick.timetableappbackend.solver.justifications.CourseStudentsGroupedInTheSameRoomJustification;
import com.patrick.timetableappbackend.solver.justifications.CoursesGroupedInTheSameTimeslotJustification;
import com.patrick.timetableappbackend.solver.justifications.CoursesInTheSameBuildingJustification;
import com.patrick.timetableappbackend.solver.justifications.GapsLongerThan4HoursJustification;
import com.patrick.timetableappbackend.solver.justifications.LabsGroupedInTheSameTimeslotJustification;
import com.patrick.timetableappbackend.solver.justifications.LabsStudentsGroupedInTheSameRoomJustification;
import com.patrick.timetableappbackend.solver.justifications.MaximizePreferredTimeslotAssignmentsJustification;
import com.patrick.timetableappbackend.solver.justifications.MaximumCoursesForStudentsJustification;
import com.patrick.timetableappbackend.solver.justifications.MaximumCoursesTeachedJustification;
import com.patrick.timetableappbackend.solver.justifications.OverlappingTimeslotJustification;
import com.patrick.timetableappbackend.solver.justifications.SeminarStudentsGroupedInTheSameRoomJustification;
import com.patrick.timetableappbackend.solver.justifications.SeminarsGroupedInTheSameTimeslotJustification;

import java.time.DayOfWeek;
import java.time.Duration;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

import static ai.timefold.solver.core.api.score.stream.ConstraintCollectors.compose;
import static ai.timefold.solver.core.api.score.stream.ConstraintCollectors.count;
import static ai.timefold.solver.core.api.score.stream.ConstraintCollectors.countDistinct;
import static ai.timefold.solver.core.api.score.stream.ConstraintCollectors.min;
import static ai.timefold.solver.core.api.score.stream.ConstraintCollectors.max;
import static ai.timefold.solver.core.api.score.stream.ConstraintCollectors.sum;
import static ai.timefold.solver.core.api.score.stream.ConstraintCollectors.toList;




public class TimetableConstraintProvider implements ConstraintProvider {

    private static final Map<Long, Set<TeacherTimeslot>> TEACHER_PREFERENCES_CACHE = new ConcurrentHashMap<>();
    private static final String FOREIGN_LANGUAGE_PREFIX = "Lb.";
    final int MAX_HOURS_PER_DAY = 10;
    final int MAX_TEACHED_HOURS_PER_DAY = 12;
    final Duration MAX_GAP = Duration.ofHours(3);
    final Duration MAX_GAP_SAME_BUILDING = Duration.ofMinutes(30);
    final Duration MAX_GAP_TEACHER_EFFICIENCY = Duration.ofMinutes(30);

    @Override
    public Constraint[] defineConstraints(ConstraintFactory constraintFactory) {
        return new Constraint[]{
                // Hard constraints
                roomConflict(constraintFactory),
                teacherConflict(constraintFactory),
                studentGroupConflict(constraintFactory),
                studentGroupConflictWithGroupBy(constraintFactory),
                capacityRoomConflict(constraintFactory),
                courseStudentsGroupedInTheSameRoom(constraintFactory),
                seminarStudentsGroupedInTheSameRoom(constraintFactory),
                labsStudentsGroupedInTheSameRoom(constraintFactory),
//                seminarAndLabStudentsGroupedInTheSameRoom(constraintFactory),
                roomConflictUniversity(constraintFactory),
                teacherConflictUniversity(constraintFactory),
                overlappingTimeslot(constraintFactory),

                //medium
                maximumCoursesForStudents(constraintFactory),
                maximizePreferredTimeslotAssignments(constraintFactory),
                coursesGroupedInTheSameTimeslot(constraintFactory),
                seminarsGroupedInTheSameTimeslot(constraintFactory),
                maximmumCoursesTeached(constraintFactory),
//                labsAndSeminarsGroupedInTheSameTimeslot(constraintFactory),

                // Soft constraints
                teacherRoomStability(constraintFactory),
                teacherTimeEfficiency(constraintFactory),
                studentGroupSubjectVariety(constraintFactory),
                coursesInTheSameBuilding(constraintFactory),
                gapsLongerThan4Hours(constraintFactory),
                labsGroupedInTheSameTimeslot(constraintFactory),
//                labAfterSeminar(constraintFactory)

                // Highschool-specific constraints
                noGapsForHighschool(constraintFactory),
                fairLessonsDistribution(constraintFactory),
                earlyStartForHighschool(constraintFactory),

                // Foreign language grouping constraints
                foreignLanguageSameTimeslot(constraintFactory),
                schoolRoomConflict(constraintFactory),
                schoolTeacherConflict(constraintFactory)

                //add other constraints (with penalty or reward) if needed

        };
    }

    Constraint roomConflict(ConstraintFactory constraintFactory) {
        // A room can accommodate at most one lesson at the same time.
        return constraintFactory
                // Select each pair of 2 different lessons ...
                .forEachUniquePair(Lesson.class,
                        // ... in the same timeslot ...
                        Joiners.equal(lesson -> lesson.getTimeslot().getId()),
                        // ... in the same room ...
                        Joiners.equal(lesson -> lesson.getRoom().getId()))
                .penalize(HardMediumSoftScore.ONE_HARD)
                .justifyWith((lesson1, lesson2, score) -> new RoomConflictJustification(lesson1.getRoom(), lesson1, lesson2))
                .asConstraint("roomConflict");
    }

    Constraint roomConflictUniversity(ConstraintFactory constraintFactory) {
        // A room can accommodate at most one lesson at the same time.
        return constraintFactory
                // Select each pair of 2 different lessons ...
                .forEachUniquePair(Lesson.class,
                        // ... in the same timeslot ...
                        Joiners.equal(lesson -> lesson.getTimeslot().getId()),
                        // ... in the same room ...
                        Joiners.equal(lesson -> lesson.getRoom().getId())
                )
                //university filtering of lessons
                .filter(((lesson1, lesson2) -> {
                     // Week parity filter — ODD vs EVEN lessons don't physically co-occur
                     if (!lesson1.getWeekParity().overlapsWith(lesson2.getWeekParity())) {
                        return false; // No conflict - different week parities don't overlap in time
                     }

                    // Early return for most common case - different series
                    if (!lesson1.getStudentGroup().getName().equals(lesson2.getStudentGroup().getName())) {
                        return true; // Conflict - different series can't share room/timeslot
                    }

                    // Same series - check specific rules
                    if (lesson1.getLessonType() == LessonType.SEMINAR && lesson2.getLessonType() == LessonType.SEMINAR) {
                        return !lesson1.getStudentGroup().getStudentGroup().equals(lesson2.getStudentGroup().getStudentGroup()) ||
                                !lesson1.getSubject().equals(lesson2.getSubject());
                    }

                    return !lesson1.getLessonType().equals(lesson2.getLessonType()) ||
                            !lesson1.getSubject().equals(lesson2.getSubject());
                }))
                .penalize(HardMediumSoftScore.ONE_HARD)
                .justifyWith((lesson1, lesson2, score) -> new RoomConflictJustification(lesson1.getRoom(), lesson1, lesson2))
                .asConstraint("roomConflictUniversity");
    }

    Constraint teacherConflict(ConstraintFactory constraintFactory) {
        // A teacher can teach at most one lesson at the same time.
        return constraintFactory
                //select each pair of 2 different lessons
                .forEachUniquePair(Lesson.class,
                        //in the same timeslot
                        Joiners.equal(lesson -> lesson.getTimeslot().getId()),
                        //with the same teacher
                        Joiners.equal(lesson -> lesson.getTeacher().getId()))
                .penalize(HardMediumSoftScore.ONE_HARD)
                .justifyWith((lesson1, lesson2, score)
                        -> new TeacherConflictJustification(lesson1.getTeacher(), lesson1, lesson2))
                .asConstraint("teacherConflict");
    }

    Constraint teacherConflictUniversity(ConstraintFactory constraintFactory) {
        // A teacher can teach at most one lesson at the same time.
        //consider that teacher A teaches a Course, teacher B teaches a Laboratory and teacher C teaches a Seminar for
        //an entire series
        return constraintFactory
                //select each pair of 2 different lessons
                .forEachUniquePair(Lesson.class,
                        //in the same timeslot
                        Joiners.equal(lesson -> lesson.getTimeslot().getId()),
                        //with the same teacher
                        Joiners.equal(lesson -> lesson.getTeacher().getId()))
                .filter(((lesson1, lesson2) -> {
                    // Week parity filter — ODD vs EVEN lessons don't physically co-occur
                    if (!lesson1.getWeekParity().overlapsWith(lesson2.getWeekParity())) {
                        return false; // No conflict - different week parities don't overlap in time
                    }

                    // Early return - different series always conflict
                    if (!lesson1.getStudentGroup().getName().equals(lesson2.getStudentGroup().getName())) {
                        return true;
                    }

                    // Different types, subjects, or rooms - conflict exists
                    if (!lesson1.getLessonType().equals(lesson2.getLessonType()) ||
                            !lesson1.getSubject().equals(lesson2.getSubject()) ||
                            !lesson1.getRoom().equals(lesson2.getRoom())) {
                        return true;
                    }

                    // Same series, type, subject, room - check group rules
                    if (lesson1.getStudentGroup().getStudentGroup().equals(lesson2.getStudentGroup().getStudentGroup())) {
                        return false; // Same group - no conflict
                    }

                    // Different groups - only COURSE type lessons can share
                    return lesson1.getLessonType() != LessonType.COURSE;
                }))
                .penalize(HardMediumSoftScore.ONE_HARD)
                .justifyWith((lesson1, lesson2, score)
                        -> new TeacherConflictJustification(lesson1.getTeacher(), lesson1, lesson2))
                .asConstraint("teacherConflictUniversity");
    }

    Constraint studentGroupConflict(ConstraintFactory constraintFactory) {

        // A student group can attend at most one lesson at the same time (more suitable for universities/colleges, but also works for schools).
        return constraintFactory
                //select each pair of 2 different lessons
                .forEachUniquePair(Lesson.class,
                        //with the same student Group
                        Joiners.equal(lesson -> lesson.getStudentGroup().getId()),
                        //in the same timeslot
                        Joiners.equal(lesson -> lesson.getTimeslot().getId()))
                // Week parity filter — ODD vs EVEN lessons don't physically co-occur
                .filter((lesson1, lesson2) -> lesson1.getWeekParity().overlapsWith(lesson2.getWeekParity()))
                .penalize(HardMediumSoftScore.ONE_HARD)
                .justifyWith((lesson1, lesson2, score) -> new StudentGroupConflictJustification(lesson1.getStudentGroup(), lesson1, lesson2))
                .asConstraint("studentGroupConflict");
    }

    Constraint studentGroupConflictWithGroupBy(ConstraintFactory constraintFactory) {

        // A student group can attend at most one lesson at the same time (more precise for schools).
        return constraintFactory
                .forEach(Lesson.class)
                .groupBy(
                        lesson -> lesson.getTimeslot().getId(),
                        Lesson::getStudentGroup,
                        toList()
                )
                .filter((timeslotId, group, lessons) -> lessons.size() > 1)
                .penalize(HardMediumSoftScore.ONE_HARD,
                        (timeslotId, group, lessons) -> lessons.size() * (lessons.size() - 1) / 2
                )
                .justifyWith(
                        (timeslotId, group, lessons, score) -> new StudentGroupConflictJustificationWithList(group, lessons)
                )
                .asConstraint("studentGroupConflictAdvanced");
    }

    Constraint overlappingTimeslot(ConstraintFactory constraintFactory) {
        // penalize overlapping Timeslot for the same student group
        return constraintFactory
                //select each 2 pair of different lessons
                .forEachUniquePair(Lesson.class,
                        //with the same student group
                        Joiners.equal(lesson -> lesson.getStudentGroup().getId()),
                        //in the same day
                        Joiners.equal((lesson) -> lesson.getTimeslot().getDayOfWeek()),
                        //with overlapping timeslots
                        Joiners.overlapping(
                                lesson -> lesson.getTimeslot().getStartTime(),
                                lesson -> lesson.getTimeslot().getEndTime()
                        )
                )
                // Week parity filter — ODD vs EVEN lessons don't physically co-occur
                .filter((lesson1, lesson2) -> lesson1.getWeekParity().overlapsWith(lesson2.getWeekParity()))
                .penalize(HardMediumSoftScore.ONE_HARD)
                .justifyWith((lesson1, lesson2, score) -> new OverlappingTimeslotJustification(lesson1, lesson2))
                .asConstraint("overlappingTimeslot");
    }

    Constraint capacityRoomConflict(ConstraintFactory constraintFactory) {
        //capacity room
        return constraintFactory
                //for every lesson
                .forEach(Lesson.class)
                //check if student's group number is bigger than room's capacity
                .filter(lesson -> lesson.getStudentGroup().getNumberOfStudents() > lesson.getRoom().getCapacity())
                .penalize(HardMediumSoftScore.ONE_HARD)
                .justifyWith((lesson, score) -> new CapacityRoomConflictJustification(lesson))
                .asConstraint("capacityRoomConflict");
    }

    Constraint maximizePreferredTimeslotAssignments(ConstraintFactory constraintFactory) {

        //Check if every lesson is assigned according to teacher's availability
        return constraintFactory.forEach(Lesson.class)
                .filter(lesson -> {
                    Set<TeacherTimeslot> preferredTimeslots = TEACHER_PREFERENCES_CACHE.computeIfAbsent(
                            lesson.getTeacher().getId(),
                            id -> lesson.getTeacher().getPreferredTimeslots()
                    );
                    if (preferredTimeslots == null || preferredTimeslots.isEmpty()) {
                        return false; // No preferences - no penalty
                    }

                    for(TeacherTimeslot preferred : preferredTimeslots) {
                        if (preferred.getDayOfWeek().equals(lesson.getTimeslot().getDayOfWeek()) &&
                                lesson.getTimeslot().getStartTime().compareTo(preferred.getStartTime()) >= 0 &&
                                lesson.getTimeslot().getEndTime().compareTo(preferred.getEndTime()) <= 0) {
                            return false; // Found a matching preferred timeslot
                        }
                    }

                    return true; // No matching preferred timeslot found
                })
                .penalize(HardMediumSoftScore.ONE_MEDIUM, (lesson) -> 1)
                .justifyWith((lesson, score) -> new MaximizePreferredTimeslotAssignmentsJustification(lesson))
                .asConstraint("maximizePreferredTimeslotAssignments");
    }

    Constraint coursesInTheSameBuilding(ConstraintFactory constraintFactory) {
        return constraintFactory
                //select each 2 pair of different lessons
                .forEachUniquePair(Lesson.class,
                        //with the sameStudentGroup
                        Joiners.equal(lesson -> lesson.getStudentGroup().getId()),
                        //in the same day
                        Joiners.equal((lesson) -> lesson.getTimeslot().getDayOfWeek()))
                .filter(((lesson1, lesson2) -> {
                    // Quick building check first
                    if (!lesson1.getRoom().getBuilding().equals(lesson2.getRoom().getBuilding())) {
                        return false;
                    }

                    // Then check if consecutive
                    Duration gap = Duration.between(lesson1.getTimeslot().getEndTime(), lesson2.getTimeslot().getStartTime());
                    boolean isConsecutive = !gap.isNegative() && gap.compareTo(MAX_GAP_SAME_BUILDING) <= 0;

                    if (!isConsecutive) {
                        // Check reverse order
                        gap = Duration.between(lesson2.getTimeslot().getEndTime(), lesson1.getTimeslot().getStartTime());
                        isConsecutive = !gap.isNegative() && gap.compareTo(MAX_GAP_SAME_BUILDING) <= 0;
                    }

                    return isConsecutive;
                }))
                .reward(HardMediumSoftScore.ONE_SOFT)
                .justifyWith((lesson1, lesson2, score) -> new CoursesInTheSameBuildingJustification(lesson1, lesson2))
                .asConstraint("coursesInTheSameBuilding");
    }

    //todo: check if we need this method
    Constraint labAfterSeminar(ConstraintFactory constraintFactory) {
        //consecutive lab-seminar or seminar-lab
        return constraintFactory
                //select each 2 pair of different lessons
                .forEachUniquePair(Lesson.class,
                        //for the same student group
                        Joiners.equal(Lesson::getStudentGroup),
                        //in the same day
                        Joiners.equal((lesson) -> lesson.getTimeslot().getDayOfWeek()))
                .filter(((lesson, lesson2) -> {
                    //Consecutive courses
                    Duration between = Duration.between(lesson.getTimeslot().getEndTime(),
                            lesson2.getTimeslot().getStartTime());

                    if ((lesson.getLessonType().equals(LessonType.SEMINAR) && lesson2.getLessonType().equals(LessonType.LABORATORY))
                            && (!between.isNegative() && between.compareTo(Duration.ofMinutes(30)) <= 0)) {
                        return true;
                    } else
                        return (lesson2.getLessonType().equals(LessonType.SEMINAR) && lesson.getLessonType().equals(LessonType.LABORATORY))
                                && (!between.isNegative() && between.compareTo(Duration.ofMinutes(30)) <= 0);
                }))
                .reward(HardMediumSoftScore.ONE_SOFT)
                //.justifyWith(((lesson, lesson2, hardSoftScore) -> new Justification(ceva)))
                .asConstraint("labAfterSeminar");
    }

    Constraint maximmumCoursesTeached(ConstraintFactory constraintFactory) {
        // optimize this method to count the total hours spent in lessons
        // maximum courses per day for teacher
        return constraintFactory.forEach(Lesson.class)
                // Create a composite key that represents unique teacher-day-timeslot combinations
                .groupBy(
                        lesson -> new TeacherDayTimeslot(
                                lesson.getTeacher(),
                                lesson.getTimeslot().getDayOfWeek(),
                                lesson.getTimeslot()
                        )
                )
                // Now group by teacher-day and sum timeslot durations
                .groupBy(
                        teacherDayTimeslot -> new TeacherDayOfWeek(
                                teacherDayTimeslot.teacher(),
                                teacherDayTimeslot.dayOfWeek()
                        ),
                        sum(teacherDayTimeslot -> (int) Duration.between(
                                teacherDayTimeslot.timeslot().getStartTime(),
                                teacherDayTimeslot.timeslot().getEndTime()).toHours())
                )
                .filter((teacherDay, totalHours) -> {
                    return totalHours > MAX_TEACHED_HOURS_PER_DAY;
                })
                .penalize(HardMediumSoftScore.ONE_MEDIUM, (teacherDay, totalHours) -> totalHours.intValue() - MAX_TEACHED_HOURS_PER_DAY)
                .justifyWith((teacherDay, totalHours, score) -> new MaximumCoursesTeachedJustification(teacherDay, totalHours.intValue()))
                .asConstraint("maximmumCoursesTeached");
    }


    Constraint maximumCoursesForStudents(ConstraintFactory constraintFactory) {
        // maximum courses per day for student group
        return constraintFactory.forEach(Lesson.class)
                .groupBy(
                        lesson -> new StudentDayOfWeek(lesson.getStudentGroup(), lesson.getTimeslot().getDayOfWeek()),
                        sum(lesson -> (int) Duration.between(
                                lesson.getTimeslot().getStartTime(),
                                lesson.getTimeslot().getEndTime()).toHours())
                )
                .filter((studentDay, totalHours) -> {
                    return totalHours > MAX_HOURS_PER_DAY;
                })
                .penalize(HardMediumSoftScore.ONE_MEDIUM, (studentDay, totalHours) -> totalHours.intValue() - MAX_HOURS_PER_DAY)
                .justifyWith((studentDay, totalHours, score) -> new MaximumCoursesForStudentsJustification(studentDay, totalHours.intValue()))
                .asConstraint("maximumCoursesForStudents");
    }

    Constraint courseStudentsGroupedInTheSameRoom(ConstraintFactory constraintFactory) {

        return constraintFactory
                //select every Lesson
                .forEach(Lesson.class)
                //that is Course type
                .filter(lesson -> lesson.getLessonType().equals(LessonType.COURSE))
                //group the lessons that are in the same timeslot, room
                // and check the number of all the students in the groups (for those in the same series) that are taking this course
                .groupBy(lesson -> lesson.getTimeslot().getId(), Lesson::getRoom, (lesson) -> lesson.getStudentGroup().getName(),
                        sum((lesson) -> lesson.getStudentGroup().getNumberOfStudents().intValue()))
                // check if the total number of students exceeds the room capacity
                .filter((timeslot, room, series, studentTotal) -> {
                    return studentTotal > room.getCapacity();
                })
//                .penalize(HardSoftScore.ONE_HARD, ((timeslot, room, series, studentTotal) -> studentTotal - room.getCapacity()))
                .penalize(HardMediumSoftScore.ONE_HARD, (timeslot, room, series, studentTotal) -> studentTotal.intValue() - room.getCapacity().intValue())
                .justifyWith((timeslot, room, series, studentTotal, score) -> new CourseStudentsGroupedInTheSameRoomJustification(timeslot, room, series, studentTotal.intValue()))
                .asConstraint("courseStudentsGroupedInTheSameRoom");
    }

    Constraint seminarStudentsGroupedInTheSameRoom(ConstraintFactory constraintFactory) {

        return constraintFactory
                //select every Lesson
                .forEach(Lesson.class)
                //that is Seminar type
                .filter(lesson -> lesson.getLessonType().equals(LessonType.SEMINAR))
                //group the lessons that are in the same timeslot, room
                // and check the number of all the students in the groups (for those in the same series) that are taking this course
                .groupBy(lesson -> lesson.getTimeslot().getId(), Lesson::getRoom, (lesson) -> lesson.getStudentGroup().getStudentGroup(), sum((lesson) -> lesson.getStudentGroup().getNumberOfStudents().intValue()))
                // check if the total number of students exceeds the room capacity
                .filter((timeslot, room, group, studentTotal) -> {
                    return studentTotal > room.getCapacity();
                })
//                .penalize(HardSoftScore.ONE_HARD, ((timeslot, room, series, studentTotal) -> studentTotal - room.getCapacity()))
                .penalize(HardMediumSoftScore.ONE_HARD, (timeslot, room, series, studentTotal) -> studentTotal.intValue() - room.getCapacity().intValue())
                .justifyWith((timeslot, room, series, studentTotal, score) -> new SeminarStudentsGroupedInTheSameRoomJustification(timeslot, room, series, studentTotal.intValue()))
                .asConstraint("seminarStudentsGroupedInTheSameRoom");
    }

    Constraint labsStudentsGroupedInTheSameRoom(ConstraintFactory constraintFactory) {

        return constraintFactory
                //select every Lesson
                .forEach(Lesson.class)
                //that is Laboratory type
                .filter(lesson -> lesson.getLessonType().equals(LessonType.LABORATORY))
                //group the lessons that are in the same timeslot, room
                // and check the number of all the students in the groups (for those in the same series) that are taking this course
                .groupBy(lesson -> lesson.getTimeslot().getId(), Lesson::getRoom, (lesson) -> lesson.getStudentGroup().getStudentGroup(), sum((lesson) -> lesson.getStudentGroup().getNumberOfStudents().intValue()))
                // check if the total number of students exceeds the room capacity
                .filter((timeslot, room, group, studentTotal) -> {
                    return studentTotal > room.getCapacity();
                })
//                .penalize(HardSoftScore.ONE_HARD, ((timeslot, room, group, studentTotal) -> studentTotal - room.getCapacity()))
                .penalize(HardMediumSoftScore.ONE_HARD, (timeslot, room, group, studentTotal) -> studentTotal.intValue() - room.getCapacity().intValue())
                .justifyWith((timeslot, room, group, studentTotal, score) -> new LabsStudentsGroupedInTheSameRoomJustification(timeslot, room, group, studentTotal.intValue()))
                .asConstraint("labsStudentsGroupedInTheSameRoom");
    }

    Constraint seminarAndLabStudentsGroupedInTheSameRoom(ConstraintFactory constraintFactory) {
        return constraintFactory
                // select every Lesson
                .forEach(Lesson.class)
                // that is Laboratory/Seminar/Project type
                .filter(lesson -> lesson.getLessonType() != LessonType.COURSE)
                // group the lessons that are in the same timeslot, room
                // and check the number of all the students in the groups (for those in the same series) that are taking this course
                .groupBy(lesson -> lesson.getTimeslot().getId(),
                        Lesson::getRoom,
                        lesson -> lesson.getStudentGroup().getStudentGroup(),
                        sum(lesson -> lesson.getStudentGroup().getNumberOfStudents().intValue())
                )
                // check if the total number of students exceeds the room capacity
                .filter((timeslotId, room, groupKey, studentTotal) -> studentTotal > room.getCapacity())
                .penalize(HardMediumSoftScore.ONE_HARD, (timeslotId, room, groupKey, studentTotal) -> studentTotal - room.getCapacity().intValue())
                .asConstraint("seminarAndLabStudentsGroupedInTheSameRoom");
    }

    Constraint coursesGroupedInTheSameTimeslot(ConstraintFactory constraintFactory) {

        return constraintFactory
                //select every Lesson
                .forEach(Lesson.class)
                // That is Course type
                .filter(lesson -> lesson.getLessonType() == LessonType.COURSE)
                // check if a lesson breaks "courses by student series" constraint
                .groupBy(
                        (lesson) -> lesson.getStudentGroup().getName(),
                        Lesson::getSubject,
                        countDistinct(lesson -> TimeslotRoom.ofTR(lesson.getTimeslot(), lesson.getRoom())))
                .filter((group, subject, timeslotAndRoomCount) -> timeslotAndRoomCount > 1)
                .penalize(HardMediumSoftScore.ONE_MEDIUM, (group, subject, timeslotAndRoomCount) -> timeslotAndRoomCount.intValue() - 1)
                .justifyWith((group, subject, timeslotAndRoomCount, score) -> new CoursesGroupedInTheSameTimeslotJustification(group, subject, timeslotAndRoomCount.intValue()))
                .asConstraint("coursesGroupedInTheSameTimeslot");
    }

    Constraint seminarsGroupedInTheSameTimeslot(ConstraintFactory constraintFactory) {

        return constraintFactory
                //select every Lesson
                .forEach(Lesson.class)
                // That is Seminar type
                .filter(lesson -> lesson.getLessonType() == LessonType.SEMINAR)
                // check if a lesson breaks "seminars by student groups" constraint
                .groupBy(
                        (lesson) -> lesson.getStudentGroup().getStudentGroup(),
                        Lesson::getSubject,
                        countDistinct(lesson -> TimeslotRoom.ofTR(lesson.getTimeslot(), lesson.getRoom())))
                .filter((group, subject, timeslotAndRoomCount) -> timeslotAndRoomCount > 1)
                .penalize(HardMediumSoftScore.ONE_MEDIUM, (group, subject, timeslotAndRoomCount) -> timeslotAndRoomCount.intValue() - 1)
                .justifyWith((group, subject, timeslotAndRoomCount, score) -> new SeminarsGroupedInTheSameTimeslotJustification(group, subject, timeslotAndRoomCount.intValue()))
                .asConstraint("seminarsGroupedInTheSameTimeslot");
    }

    Constraint labsGroupedInTheSameTimeslot(ConstraintFactory constraintFactory) {

        return constraintFactory
                //select every Lesson
                .forEach(Lesson.class)
                // That is Laboratory type
                .filter(lesson -> lesson.getLessonType() == LessonType.LABORATORY)
                // check if a lesson breaks "laboratories by student groups where it is possible" constraint
                .groupBy(
                        (lesson) -> lesson.getStudentGroup().getStudentGroup(),
                        Lesson::getSubject,
                        countDistinct(lesson -> TimeslotRoom.ofTR(lesson.getTimeslot(), lesson.getRoom())))
                .filter((group, subject, timeslotAndRoomCount) -> timeslotAndRoomCount > 1)
                .penalize(HardMediumSoftScore.ONE_MEDIUM, (group, subject, timeslotAndRoomCount) -> timeslotAndRoomCount.intValue() - 1)
                .justifyWith((group, subject, timeslotAndRoomCount, score) -> new LabsGroupedInTheSameTimeslotJustification(group, subject, timeslotAndRoomCount.intValue()))
                .asConstraint("labsGroupedInTheSameTimeslot");
    }

    Constraint labsAndSeminarsGroupedInTheSameTimeslot(ConstraintFactory constraintFactory) {
        return constraintFactory
                //select every Lesson
                .forEach(Lesson.class)
                // That is not Course Type
                .filter(lesson -> lesson.getLessonType() != LessonType.COURSE)
                // check if a lesson breaks "laboratories/seminars/projects by student groups where it is possible" constraint
                .groupBy(
                        (lesson) -> lesson.getStudentGroup().getStudentGroup(),
                        Lesson::getSubject,
                        countDistinct(lesson -> TimeslotRoom.ofTR(lesson.getTimeslot(), lesson.getRoom())))
                .filter((group, subject, timeslotAndRoomCount) -> timeslotAndRoomCount > 1)
                .penalize(HardMediumSoftScore.ONE_MEDIUM, (group, subject, timeslotAndRoomCount) -> timeslotAndRoomCount - 1)
                //.justifyWith()
                .asConstraint("labsAndSeminarsGroupedInTheSameTimeslot");
    }

    Constraint gapsLongerThan4Hours(ConstraintFactory constraintFactory) {

        // 4 hours gaps between lessons for students in the same day
        return constraintFactory
                //select each 2 pair of different lessons
                .forEach(Lesson.class)
                .join(Lesson.class,
                        //with the same student group
                        Joiners.equal(lesson -> lesson.getStudentGroup().getId()),
                        //in the same day
                        Joiners.equal((lesson) -> lesson.getTimeslot().getDayOfWeek()),
                        //the first lesson's timeslot is before the second lesson's timeslot
                        Joiners.lessThan(lesson -> lesson.getTimeslot().getStartTime(),
                                lesson -> lesson.getTimeslot().getStartTime()))
                .ifNotExists(Lesson.class,
                        //with the same student group
                        Joiners.equal((a, b) -> a.getStudentGroup().getId(), lesson -> lesson.getStudentGroup().getId()),
                        //in the same day
                        Joiners.equal((a, b) -> a.getTimeslot().getDayOfWeek(), (lesson) -> lesson.getTimeslot().getDayOfWeek()),
                        //is between the two timeslots
                        Joiners.lessThan((a, b) -> a.getTimeslot().getEndTime(), (lesson) -> lesson.getTimeslot().getStartTime()),
                        Joiners.greaterThan((a, b) -> b.getTimeslot().getStartTime(), (lesson) -> lesson.getTimeslot().getStartTime())
                )
                .filter((lesson1, lesson2) -> {
                    Duration between = Duration.between(lesson1.getTimeslot().getEndTime(),
                            lesson2.getTimeslot().getStartTime());
                    return !between.isNegative() && between.compareTo(MAX_GAP) > 0;
                })
                .penalize(HardMediumSoftScore.ONE_SOFT)
                .justifyWith((lesson1, lesson2, score) -> new GapsLongerThan4HoursJustification(lesson1, lesson2))
                .asConstraint("gapsLongerThan4Hours");
    }

    Constraint teacherRoomStability(ConstraintFactory constraintFactory) {
        // A teacher prefers to teach in a single room.
        return constraintFactory
                //select each 2 pair of *different* lessons
                .forEachUniquePair(Lesson.class,
                        // with the same teacher
                        Joiners.equal(lesson -> lesson.getTeacher().getId())
                )
                .filter((lesson1, lesson2) -> {
                    Duration between = Duration.between(lesson1.getTimeslot().getEndTime(),
                            lesson2.getTimeslot().getStartTime());
                    boolean consecutiveLessons = !between.isNegative()
                            && between.compareTo(Duration.ofMinutes(30)) <= 0;
                    return consecutiveLessons && lesson1.getRoom().equals(lesson2.getRoom())
                            && lesson1.getTimeslot().equals(lesson2.getTimeslot());
                })
                .reward(HardMediumSoftScore.ONE_SOFT)
                .justifyWith((lesson1, lesson2, score) -> new TeacherRoomStabilityJustification(lesson1.getTeacher(), lesson1, lesson2))
                .asConstraint("teacherRoomStability");
    }

    Constraint teacherTimeEfficiency(ConstraintFactory constraintFactory) {
        // A teacher prefers to teach sequential lessons and dislikes gaps between lessons.
        return constraintFactory
                //select each 2 pair of different lessons
                .forEachUniquePair(Lesson.class,
                        // with the same teacher
                        Joiners.equal(lesson -> lesson.getTeacher().getId()),
                        // in the same day
                        Joiners.equal((lesson) -> lesson.getTimeslot().getDayOfWeek()))
                .filter((lesson1, lesson2) -> {
                    Duration between = Duration.between(lesson1.getTimeslot().getEndTime(),
                            lesson2.getTimeslot().getStartTime());
                    return !between.isNegative() && between.compareTo(MAX_GAP_TEACHER_EFFICIENCY) <= 0;
                })
                .reward(HardMediumSoftScore.ONE_SOFT)
                .justifyWith((lesson1, lesson2, score) -> new TeacherTimeEfficiencyJustification(lesson1.getTeacher(), lesson1, lesson2))
                .asConstraint("teacherTimeEfficiency");
    }

    Constraint studentGroupSubjectVariety(ConstraintFactory constraintFactory) {
        // A student group dislikes sequential lessons on the same subject.
        return constraintFactory
                .forEach(Lesson.class)
                //for every lesson
                .join(Lesson.class,
                        //for the same student group
                        Joiners.equal(lesson -> lesson.getStudentGroup().getId()),
                        //with the same subject
                        Joiners.equal(Lesson::getSubject),
                        //in the same day
                        Joiners.equal((lesson) -> lesson.getTimeslot().getDayOfWeek()))
                .filter((lesson1, lesson2) -> {
                    //check if the lessons are consecutive
                    Duration between = Duration.between(lesson1.getTimeslot().getEndTime(),
                            lesson2.getTimeslot().getStartTime());
                    return !between.isNegative() && between.compareTo(Duration.ofMinutes(30)) <= 0;
                })
                .penalize(HardMediumSoftScore.ONE_SOFT)
                .justifyWith((lesson1, lesson2, score) -> new StudentGroupSubjectVarietyJustification(lesson1.getStudentGroup(), lesson1, lesson2))
                .asConstraint("studentGroupVariety");
    }


    /**
     * Incremental collector combining min(startTime), max(endTime) and sum(durationMinutes)
     * into a single O(1) update — avoids materialising the lesson list.
     */
    private static ai.timefold.solver.core.api.score.stream.uni.UniConstraintCollector<Lesson, ?, LessonDayStats>
            lessonDayStatsCollector() {
        return compose(
                min((Lesson lesson) -> lesson.getTimeslot().getStartTime()),
                max((Lesson lesson) -> lesson.getTimeslot().getEndTime()),
                sum((Lesson lesson) -> Duration.between(
                        lesson.getTimeslot().getStartTime(),
                        lesson.getTimeslot().getEndTime()
                ).toMinutes()),
                LessonDayStats::new
        );
    }

    Constraint noGapsForHighschool(ConstraintFactory constraintFactory) {
        // No gaps for highschool students
        return constraintFactory.forEach(Lesson.class)
                // Group by student group and day of week
                .groupBy(
                        lesson -> new StudentDayOfWeek(
                                lesson.getStudentGroup(),
                                lesson.getTimeslot().getDayOfWeek()),
                        lessonDayStatsCollector()
                )
                // if there are gaps between lessons, penalize
                .filter((studentDay, stats) -> stats.gapMinutes() > 0)
                .penalize(HardMediumSoftScore.ONE_SOFT, (studentDay, stats) -> (int) stats.gapMinutes())
                .justifyWith((studentDay, stats, score) ->
                        new NoGapsHighSchoolJustification(
                                studentDay.studentGroup(),
                                studentDay.dayOfWeek(),
                                stats.gapMinutes())
                )
                .asConstraint("noGapsForHighschool");
    }

    Constraint fairLessonsDistribution(ConstraintFactory constraintFactory) {
        // Fair distribution of lessons throughout the day
        return constraintFactory.forEach(Lesson.class)
                // Group by student group and day of week
                .groupBy(
                        lesson -> new StudentDayOfWeek(
                                lesson.getStudentGroup(),
                                lesson.getTimeslot().getDayOfWeek()),
                        count()
                )
                // Penalize if the number of lessons is not fair (try to minimize the count)
                .penalize(HardMediumSoftScore.ONE_SOFT, (studentDay, lessonCount) -> lessonCount.intValue() * lessonCount.intValue())
                .justifyWith((studentDay, lessonCount, score) ->
                        new FairLessonsDistributionJustification(
                                studentDay.studentGroup(),
                                studentDay.dayOfWeek(),
                                lessonCount.intValue())
                )
                .asConstraint("fairLessonsDistribution");
    }

    Constraint earlyStartForHighschool(ConstraintFactory constraintFactory) {
        // Assuming that 08:00 is the absolute earliest the school can start
        java.time.LocalTime schoolDayStart = java.time.LocalTime.of(8, 0);

        return constraintFactory.forEach(Lesson.class)
                .groupBy(
                        lesson -> new StudentDayOfWeek(
                                lesson.getStudentGroup(),
                                lesson.getTimeslot().getDayOfWeek()),
                        // Find the start time of the earliest lesson for this group/day
                        ai.timefold.solver.core.api.score.stream.ConstraintCollectors.<Lesson, java.time.LocalTime>min(lesson -> lesson.getTimeslot().getStartTime())
                )
                // Only penalize if the earliest lesson actually starts after 08:00
                .filter((studentDay, earliestStartTime) ->
                        earliestStartTime.isAfter(schoolDayStart)
                )
                // Penalize by the number of minutes past 08:00 AM the first lesson starts
                .penalize(HardMediumSoftScore.ONE_SOFT, (studentDay, earliestStartTime) ->
                        (int) java.time.Duration.between(schoolDayStart, earliestStartTime).toMinutes()
                )
                .justifyWith((studentDay, earliestStartTime, score) ->
                        new EarlyStartHighSchoolJustification(
                                studentDay.studentGroup(),
                                studentDay.dayOfWeek(),
                                earliestStartTime,
                                (int) java.time.Duration.between(schoolDayStart, earliestStartTime).toMinutes())
                )
                .asConstraint("earlyStartForHighschool");
    }

    // ── Foreign Language Grouping Constraints ──────────────────────────────────

    /**
     * Checks if a lesson is a foreign language lesson (subject starts with "Lb.").
     * Covers: "Lb. ger/fr", "Lb. fr", "Lb. ger", etc.
     */
    private boolean isForeignLanguage(Lesson lesson) {
        return lesson.getSubject() != null
                && lesson.getSubject().startsWith(FOREIGN_LANGUAGE_PREFIX);
    }

    /**
     * Checks if two lessons are both foreign language lessons of the same academic year.
     * Used by school conflict constraints to exempt these pairs from room/teacher conflicts,
     * since the solver needs freedom to place them in the same timeslot.
     */
    private boolean areSameYearForeignLanguagePair(Lesson lesson1, Lesson lesson2) {
        return isForeignLanguage(lesson1)
                && isForeignLanguage(lesson2)
                && lesson1.getStudentGroup().getYear() != null
                && lesson1.getStudentGroup().getYear() == lesson2.getStudentGroup().getYear();
    }

    Constraint foreignLanguageSameTimeslot(ConstraintFactory constraintFactory) {
        // Foreign language lessons must be in the same timeslot for the same academic year
        return constraintFactory
                // 1. Start with only foreign language lessons
                .forEach(Lesson.class)
                .filter(this::isForeignLanguage)
                
                // 2. Join ONLY with other foreign language lessons
                .join(
                        constraintFactory.forEach(Lesson.class).filter(this::isForeignLanguage),
                        // Match them if they share the same Academic Year (e.g., Year 5)
                        Joiners.equal(lesson -> lesson.getStudentGroup().getYear()),
                        // Ensure we only check unique pairs (A vs B, not B vs A)
                        Joiners.lessThan(Lesson::getId)
                )
                
                // 3. Apply critical logic rules
                .filter((lesson1, lesson2) -> 
                        // Rule A: They must belong to DIFFERENT classes (e.g., 5A vs 5B) 
                        // Otherwise we'd penalize a single class for having lessons on different days.
                        !lesson1.getStudentGroup().getId().equals(lesson2.getStudentGroup().getId()) 
                        && 
                        // Rule B: Penalize if they did NOT end up in the exact same timeslot
                        !lesson1.getTimeslot().getId().equals(lesson2.getTimeslot().getId())
                )
                .penalize(HardMediumSoftScore.ONE_SOFT)
                .justifyWith((lesson1, lesson2, score) -> 
                        new ForeignLanguageSameTimeslotJustification(lesson1, lesson2))
                .asConstraint("foreignLanguageSameTimeslot");
    }

    /**
     * School-specific room conflict: identical to {@link #roomConflict} but EXEMPTS pairs where
     * both lessons are foreign language lessons of the same academic year.
     */
    Constraint schoolRoomConflict(ConstraintFactory constraintFactory) {
        return constraintFactory
                .forEachUniquePair(Lesson.class,
                        Joiners.equal(lesson -> lesson.getTimeslot().getId()),
                        Joiners.equal(lesson -> lesson.getRoom().getId()))
                // Exempt same-year foreign language pairs from room conflict
                .filter((lesson1, lesson2) -> !areSameYearForeignLanguagePair(lesson1, lesson2))
                .penalize(HardMediumSoftScore.ONE_HARD)
                .justifyWith((lesson1, lesson2, score) ->
                        new RoomConflictJustification(lesson1.getRoom(), lesson1, lesson2))
                .asConstraint("schoolRoomConflict");
    }

    /**
     * School-specific teacher conflict: identical to {@link #teacherConflict} but EXEMPTS pairs
     * where both lessons are foreign language lessons of the same academic year.
     */
    Constraint schoolTeacherConflict(ConstraintFactory constraintFactory) {
        return constraintFactory
                .forEachUniquePair(Lesson.class,
                        Joiners.equal(lesson -> lesson.getTimeslot().getId()),
                        Joiners.equal(lesson -> lesson.getTeacher().getId()))
                // Exempt same-year foreign language pairs from teacher conflict
                .filter((lesson1, lesson2) -> !areSameYearForeignLanguagePair(lesson1, lesson2))
                .penalize(HardMediumSoftScore.ONE_HARD)
                .justifyWith((lesson1, lesson2, score) ->
                        new TeacherConflictJustification(lesson1.getTeacher(), lesson1, lesson2))
                .asConstraint("schoolTeacherConflict");
    }

    public record TeacherDayOfWeek(Teacher teacher, DayOfWeek dayOfWeek) {

        static TeacherDayOfWeek ofTD(Teacher teacher, DayOfWeek dayOfWeek) {
            return new TeacherDayOfWeek(teacher, dayOfWeek);
        }
    }

    public record StudentDayOfWeek(StudentGroup studentGroup, DayOfWeek dayOfWeek) {

        static StudentDayOfWeek ofSD(StudentGroup studentGroup, DayOfWeek dayOfWeek) {
            return new StudentDayOfWeek(studentGroup, dayOfWeek);
        }
    }

    public record TimeslotRoom(Timeslot timeslot, Room room) {

        static TimeslotRoom ofTR(Timeslot timeslot, Room room) {
            return new TimeslotRoom(timeslot, room);
        }
    }

    public record TeacherDayTimeslot(Teacher teacher, DayOfWeek dayOfWeek, Timeslot timeslot) {
        static TeacherDayTimeslot of(Teacher teacher, DayOfWeek dayOfWeek, Timeslot timeslot) {
            return new TeacherDayTimeslot(teacher, dayOfWeek, timeslot);
        }
    }

    /**
     * Pre-computed stats for a student group on a given day.
     * Produced by {@link #lessonDayStatsCollector()} — no repeated stream iterations needed.
     *
     * @param earliestStart  start time of the first lesson
     * @param latestEnd      end time of the last lesson
     * @param totalInstructionMinutes sum of all lesson durations in minutes
     */
    public record LessonDayStats(
            java.time.LocalTime earliestStart,
            java.time.LocalTime latestEnd,
            long totalInstructionMinutes
    ) {
        /** Gap size in minutes: span − instruction time. Positive means a gap exists. */
        public long gapMinutes() {
            return Duration.between(earliestStart, latestEnd).toMinutes() - totalInstructionMinutes;
        }
    }
}
