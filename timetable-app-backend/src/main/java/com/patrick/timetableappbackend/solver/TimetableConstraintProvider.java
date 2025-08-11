package com.patrick.timetableappbackend.solver;

import ai.timefold.solver.core.api.score.stream.Constraint;
import ai.timefold.solver.core.api.score.stream.ConstraintFactory;
import ai.timefold.solver.core.api.score.stream.ConstraintProvider;
import ai.timefold.solver.core.api.score.stream.Joiners;
import com.patrick.timetableappbackend.model.*;
import com.patrick.timetableappbackend.solver.justifications.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.DayOfWeek;
import java.time.Duration;
import java.util.Set;

import static ai.timefold.solver.core.api.score.stream.ConstraintCollectors.countDistinct;
import static ai.timefold.solver.core.api.score.stream.ConstraintCollectors.sum;

public class TimetableConstraintProvider implements ConstraintProvider {

    private static final Logger LOGGER = LoggerFactory.getLogger(TimetableConstraintProvider.class);

    @Override
    public Constraint[] defineConstraints(ConstraintFactory constraintFactory) {
        return new Constraint[]{
                // Hard constraints
                roomConflict(constraintFactory),
                teacherConflict(constraintFactory),
                studentGroupConflict(constraintFactory),
                capacityRoomConflict(constraintFactory),
                courseStudentsGroupedInTheSameRoom(constraintFactory),
                seminarStudentsGroupedInTheSameRoom(constraintFactory),
                labsStudentsGroupedInTheSameRoom(constraintFactory),
                roomConflictUniversity(constraintFactory),
                teacherConflictUniversity(constraintFactory),
                overlappingTimeslot(constraintFactory),
                lessonDurationConflict(constraintFactory),

                //medium
                maximumCoursesForStudents(constraintFactory),
                maximizePreferredTimeslotAssignments(constraintFactory),
                coursesGroupedInTheSameTimeslot(constraintFactory),
                seminarsGroupedInTheSameTimeslot(constraintFactory),
                maximmumCoursesTeached(constraintFactory),

                // Soft constraints
                teacherRoomStability(constraintFactory),
                teacherTimeEfficiency(constraintFactory),
                studentGroupSubjectVariety(constraintFactory),
                coursesInTheSameBuilding(constraintFactory),
                gapsLongerThan4Hours(constraintFactory),
                labsGroupedInTheSameTimeslot(constraintFactory),
                labAfterSeminar(constraintFactory)

                //add other constraints (with penalty or reward) if needed

        };
    }

    Constraint roomConflict(ConstraintFactory constraintFactory) {
        // A room can accommodate at most one lesson at the same time.
        return constraintFactory
                // Select each pair of 2 different lessons ...
                .forEachUniquePair(Lesson.class,
                        // ... in the same timeslot ...
                        Joiners.equal(Lesson::getTimeslot),
                        // ... in the same room ...
                        Joiners.equal(Lesson::getRoom))
                //.penalize(HardSoftScore.ONE_HARD)
                .penalizeConfigurable()
                .justifyWith((lesson1, lesson2, score) -> new RoomConflictJustification(lesson1.getRoom(), lesson1, lesson2))
                .asConstraint("roomConflict");
    }

    Constraint roomConflictUniversity(ConstraintFactory constraintFactory) {
        // A room can accommodate at most one lesson at the same time.
        return constraintFactory
                // Select each pair of 2 different lessons ...
                .forEachUniquePair(Lesson.class,
                        // ... in the same timeslot ...
                        Joiners.equal(Lesson::getTimeslot),
                        // ... in the same room ...
                        Joiners.equal(Lesson::getRoom)
                )
                //university filtering of lessons
                .filter(((lesson, lesson2) -> {

                    LOGGER.info("roomConflictUniversity - lesson: {}", lesson);
                    LOGGER.info("roomConflictUniversity - lesson2: {}", lesson2);
                    boolean sameSubject = lesson.getSubject().equals(lesson2.getSubject());
                    boolean sameLessonType = lesson.getLessonType().equals(lesson2.getLessonType());
                    boolean sameSeries = lesson.getStudentGroup().getName().equals(lesson2.getStudentGroup().getName());
                    boolean sameSeminarType = lesson.getLessonType().equals(LessonType.SEMINAR) && lesson2.getLessonType().equals(LessonType.SEMINAR);
                    boolean sameStudentGroup = lesson.getStudentGroup().getStudentGroup().equals(lesson2.getStudentGroup().getStudentGroup());
                    boolean sameYear = lesson.getStudentGroup().getYear().equals(lesson2.getYear());
                    LOGGER.info("roomConflictUniversity - sameSeries or sameYear {}", sameSeries);
                    if (sameSeries) {
                        if (sameSeminarType) {
                            return !sameStudentGroup || !sameSubject;
                        }
                        LOGGER.info("roomConflictUniversity - !sameCourseType || !sameSubject: {}", !sameLessonType || !sameSubject);
                        return !sameLessonType || !sameSubject;
                    }
                    return true;
                }))
                //.penalize(HardSoftScore.ONE_HARD)
                .penalizeConfigurable()
                .justifyWith((lesson1, lesson2, score) -> new RoomConflictJustification(lesson1.getRoom(), lesson1, lesson2))
                .asConstraint("roomConflictUniversity");
    }

    Constraint teacherConflict(ConstraintFactory constraintFactory) {
        // A teacher can teach at most one lesson at the same time.
        return constraintFactory
                //select each pair of 2 different lessons
                .forEachUniquePair(Lesson.class,
                        //in the same timeslot
                        Joiners.equal(Lesson::getTimeslot),
                        //with the same teacher
                        Joiners.equal(Lesson::getTeacher))
                .penalizeConfigurable()
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
                        Joiners.equal(Lesson::getTimeslot),
                        //with the same teacher
                        Joiners.equal(Lesson::getTeacher))
                .filter(((lesson, lesson2) -> {

                    boolean theSameCourse = lesson.getSubject().equals(lesson2.getSubject());
//                    boolean theSameYearOfCourse = lesson.getYear().equals(lesson2.getYear());
                    boolean sameType = lesson.getLessonType().equals(lesson2.getLessonType());
                    boolean theSameCourseType = lesson.getLessonType().equals(LessonType.COURSE) && lesson2.getLessonType().equals(LessonType.COURSE);
                    boolean theSameSeries = lesson.getStudentGroup().getName().equals(lesson2.getStudentGroup().getName());
                    boolean sameSeminarType = lesson.getLessonType().equals(LessonType.SEMINAR) && lesson2.getLessonType().equals(LessonType.SEMINAR);
                    boolean sameLabType = lesson.getLessonType().equals(LessonType.LABORATORY) && lesson2.getLessonType().equals(LessonType.LABORATORY);
                    boolean sameSubject = lesson.getSubject().equals(lesson2.getSubject());
                    boolean sameRoom = lesson.getRoom().equals(lesson2.getRoom());
//                    boolean sameYear = lesson.getStudentGroup().getYear().equals(lesson2.getYear());
//                    boolean theSameStudentGroup = lesson.getStudentGroup().getId().equals(lesson2.getStudentGroup().getId());
                    boolean theSameGroup = lesson.getStudentGroup().getStudentGroup().equals(lesson2.getStudentGroup().getStudentGroup());
                    LOGGER.info("teacherConflictUniversity - theSameSeries: {}", theSameSeries);
                    if (theSameSeries) {

                        if (!sameType) {
                            LOGGER.info("teacherConflictUniversity - !sameType");
                            return true;
                        }
                        if (!sameSubject) {
                            LOGGER.info("teacherConflictUniversity - !sameSubject");
                            return true;
                        }

                        if (!sameRoom) {
                            LOGGER.info("teacherConflictUniversity - different rooms");
                            return true;
                        }

                        if (theSameGroup) {
                            LOGGER.info("teacherConflictUniversity - same group with same Lesson type and subject in the same Room is ok");
                            return false;
                        } else {
                            if (theSameCourseType) {
                                LOGGER.info("teacherConflictUniversity - different group with same Course type Lesson is ok");
                                return false;
                            }
                            if (sameSeminarType) {
                                LOGGER.info("teacherConflictUniversity - different group with same Seminar type Lesson is not ok");
                                return true;
                            }
                            if (sameLabType) {
                                LOGGER.info("teacherConflictUniversity - different group with same Lab");
                                return true;
                            }
                            LOGGER.info("teacherConflictUniversity - other edge case for different group");
                        }
                        LOGGER.info("teacherConflictUniversity - other edge within same series");
                        return true; //maybe we can find another edge cases
                    }
                    LOGGER.info("teacherConflictUniversity - not same series - not ok");
                    return true;
//                    return !(theSameCourse && theSameYearOfCourse && theSameSeries);
                }))
//                .penalize(HardSoftScore.ONE_HARD)
                .penalizeConfigurable()
                .justifyWith((lesson1, lesson2, score)
                        -> new TeacherConflictJustification(lesson1.getTeacher(), lesson1, lesson2))
                .asConstraint("teacherConflictUniversity");
    }

    Constraint studentGroupConflict(ConstraintFactory constraintFactory) {

        // A student group can attend at most one lesson at the same time.
        return constraintFactory
                //select each pair of 2 different lessons
                .forEachUniquePair(Lesson.class,
                        //with the same student Group
                        Joiners.equal(Lesson::getStudentGroup),
                        //in the same timeslot
                        Joiners.equal(Lesson::getTimeslot))

                //.penalize(HardSoftScore.ONE_HARD)
                .penalizeConfigurable()
                .justifyWith((lesson1, lesson2, score) -> new StudentGroupConflictJustification(lesson1.getStudentGroup(), lesson1, lesson2))
                .asConstraint("studentGroupConflict");
    }

    Constraint overlappingTimeslot(ConstraintFactory constraintFactory) {
        // penalize overlapping Timeslot for the same student group
        return constraintFactory
                //select each 2 pair of different lessons
                .forEachUniquePair(Lesson.class,
                        //with the same student group
                        Joiners.equal(Lesson::getStudentGroup),
                        //in the same day
                        Joiners.equal((lesson) -> lesson.getTimeslot().getDayOfWeek()),
                        //with overlapping timeslots
                        Joiners.overlapping(
                                lesson -> lesson.getTimeslot().getStartTime(),
                                lesson -> lesson.getTimeslot().getEndTime()
                        )
                )
                .penalizeConfigurable()
                //.justifyWith((lesson1, lesson2, score) -> new OverlappingJustification(lesson, timeslot))
                .asConstraint("overlappingTimeslot");
    }

    Constraint lessonDurationConflict(ConstraintFactory constraintFactory) {
        //for each lesson ensure that a lesson with duration x is assigned to a timeslot with duration x
        //in future, create a built-in constraint
        return constraintFactory.forEach(Lesson.class)
                .filter((lesson -> {
                    Duration between = Duration.between(lesson.getTimeslot().getStartTime(),
                            lesson.getTimeslot().getEndTime());
                    return lesson.getDuration() != between.toHours();
                }))
                .penalizeConfigurable()
                //.justifyWith()
                .asConstraint("lessonDurationConflict");
    }

    Constraint capacityRoomConflict(ConstraintFactory constraintFactory) {
        //capacity room
        return constraintFactory
                //for every lesson
                .forEach(Lesson.class)
                .filter(lesson -> {
                    //check if student's group number is bigger than room's capacity
                    return lesson.getRoom().getCapacity() < lesson.getStudentGroup().getNumberOfStudents();
                }).penalizeConfigurable()
                //.justifyWith((parameters) -> new Justification(room)
                .asConstraint("capacityRoomConflict");
    }

    Constraint maximizePreferredTimeslotAssignments(ConstraintFactory constraintFactory) {

        //Check if every lesson is assigned according to teacher's availability
        return constraintFactory.forEach(Lesson.class)
                .filter(lesson -> {
                    LOGGER.info("lesson's teacher get preferred Timeslot: {}", lesson.getTeacher().getPreferredTimeslots());
                    LOGGER.info("lesson's Timeslot: {}", lesson.getTimeslot());
                    LOGGER.info("-------------------------------------------------");
                    return (lesson.getTeacher().getPreferredTimeslots() != null &&
                            !isTeacherAssignedToPreferredTimeslot(lesson));
                })
//                .penalize(HardSoftScore.ONE_HARD)
                .penalizeConfigurable((lesson) -> {
//                    LOGGER.info("maximizePrefferedTimeslotsAssignments penalty");
                    return 1;
                })
                //.justifyWith
                .asConstraint("maximizePreferredTimeslotAssignments");
    }

    Constraint coursesInTheSameBuilding(ConstraintFactory constraintFactory) {
        return constraintFactory
                //select each 2 pair of different lessons
                .forEachUniquePair(Lesson.class,
                        //with the sameStudentGroup
                        Joiners.equal(Lesson::getStudentGroup),
                        //in the same day
                        Joiners.equal((lesson) -> lesson.getTimeslot().getDayOfWeek()))
                .filter(((lesson, lesson2) -> {
                    //consecutive courses - check if they are in the same building
                    Duration between = Duration.between(lesson.getTimeslot().getEndTime(),
                            lesson2.getTimeslot().getStartTime());
                    boolean consecutiveCourses = !between.isNegative() && between.compareTo(Duration.ofMinutes(30)) <= 0;
                    boolean sameBuilding = lesson.getRoom().getBuilding().equals(lesson2.getRoom().getBuilding());
                    LOGGER.info("coursesInTheSameBuilding - consecutiveCourses: {}", consecutiveCourses);
                    LOGGER.info("coursesInTheSameBuilding - sameBuilding: {}", sameBuilding);
                    return sameBuilding && consecutiveCourses;
                }))
//                .reward(HardSoftScore.ONE_SOFT)
                .rewardConfigurable()
                //.justifyWith()
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
//                .reward(HardSoftScore.ONE_SOFT)
                .rewardConfigurable()
                //.justifyWith(((lesson, lesson2, hardSoftScore) -> new Justification(ceva)))
                .asConstraint("labAfterSeminar");
    }

    Constraint maximmumCoursesTeached(ConstraintFactory constraintFactory) {
        //optimize this method to count the total hours spent in lessons
        //maximmum courses per day for teacher
        int maxHoursPerDay = 12;

        return constraintFactory.forEach(Lesson.class)
                .groupBy(
                        Lesson::getTimeslot,
                        Lesson::getTeacher
                )
                .groupBy((timeslot, teacher) -> TeacherDayOfWeek.ofTD(teacher, timeslot.getDayOfWeek()), sum((timeslot1, teacher1) -> (int) calculateTimeslotDuration(timeslot1)))
                .filter((teacherDayOfWeek, count) -> {
                    LOGGER.info("MaximmumCoursesTeached - This is teacher - day of week: {}", teacherDayOfWeek);
                    LOGGER.info("MaximmumCoursesTeached - This is count: {}", count);

                    return count > maxHoursPerDay;
                })
//                .penalize(HardSoftScore.ONE_HARD, ((teacher, integer) -> integer - maxCoursesPerDay))
                .penalizeConfigurable((teacherDayOfWeek, integer) -> {
                    LOGGER.info("Penalize for teacher with {}", integer - maxHoursPerDay);
                    return integer - maxHoursPerDay;
                })
                .asConstraint("maximmumCoursesTeached");
    }


    Constraint maximumCoursesForStudents(ConstraintFactory constraintFactory) {
        //optimize this method to count the total hours spent in lessons
        //maximmum courses per day for student group
        int maxHoursPerDay = 10;

        return constraintFactory
                .forEach(Lesson.class)
                .groupBy(
                        Lesson::getStudentGroup,
                        Lesson::getTimeslot
                )
                //try to sum the duration between slots
                .groupBy((studentGroup, timeslot) -> StudentDayOfWeek.ofSD(studentGroup, timeslot.getDayOfWeek()), sum((studentGroup, timeslot) -> (int) calculateTimeslotDuration(timeslot)))
                .filter((s, count) -> {
                    LOGGER.info("MaximmumCoursesForStudents - This is the student - DayOfWeek = {}", s);
                    LOGGER.info("MaximumCoursesForStudents - This is the count = {}", count);
                    return count > maxHoursPerDay;
                })
//                .penalize(HardSoftScore.ONE_HARD, ((studentDayOfWeek, integer) -> integer - maxCoursesPerDay))
                .penalizeConfigurable(((studentDayOfWeek, integer) -> {
                    LOGGER.info("Penalize for student with {}", integer - maxHoursPerDay);
                    return integer - maxHoursPerDay;
                }))
                //.justifyWith()
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
                .groupBy(Lesson::getTimeslot, Lesson::getRoom, (lesson) -> lesson.getStudentGroup().getName(),
                        sum((lesson) -> Math.toIntExact(lesson.getStudentGroup().getNumberOfStudents())))
                // check if the total number of students exceeds the room capacity
                .filter((timeslot, room, series, studentTotal) -> {
                    LOGGER.info("coursesGroupedInTheSameTimeslot - timeslot: {}", timeslot);
                    LOGGER.info("courseStudentsGroupedInTheSameRoom - room: {}", room);
                    LOGGER.info("courseStudentsGroupedInTheSameRoom - series: {}", series);
                    LOGGER.info("courseStudentsGroupedInTheSameRoom - studentTotal: {}", studentTotal);
                    LOGGER.info("-------------------------------");
                    return studentTotal > room.getCapacity();
                })
//                .penalize(HardSoftScore.ONE_HARD, ((timeslot, room, series, studentTotal) -> studentTotal - room.getCapacity()))
                .penalizeConfigurable((timeslot, room, series, studentTotal) -> (int) (studentTotal - room.getCapacity()))
                //.justifyWith()
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
                .groupBy(Lesson::getTimeslot, Lesson::getRoom, (lesson) -> lesson.getStudentGroup().getStudentGroup(), sum((lesson) -> Math.toIntExact(lesson.getStudentGroup().getNumberOfStudents())))
                // check if the total number of students exceeds the room capacity
                .filter((timeslot, room, group, studentTotal) -> {
                    LOGGER.info("seminarStudentsGroupedInTheSameRoom - timeslot: {}", timeslot);
                    LOGGER.info("seminarStudentsGroupedInTheSameRoom - room: {}", room);
                    LOGGER.info("seminarStudentsGroupedInTheSameRoom - series: {}", group);
                    LOGGER.info("seminarStudentsGroupedInTheSameRoom - studentTotal: {}", studentTotal);
                    LOGGER.info("-------------------------------");
                    return studentTotal > room.getCapacity();
                })
//                .penalize(HardSoftScore.ONE_HARD, ((timeslot, room, series, studentTotal) -> studentTotal - room.getCapacity()))
                .penalizeConfigurable((timeslot, room, series, studentTotal) -> (int) (studentTotal - room.getCapacity()))
                //.justifyWith()
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
                .groupBy(Lesson::getTimeslot, Lesson::getRoom, (lesson) -> lesson.getStudentGroup().getStudentGroup(), sum((lesson) -> Math.toIntExact(lesson.getStudentGroup().getNumberOfStudents())))
                // check if the total number of students exceeds the room capacity
                .filter((timeslot, room, group, studentTotal) -> {
                    LOGGER.info("labsStudentsGroupedInTheSameRoom - timeslot: {}", timeslot);
                    LOGGER.info("labsStudentsGroupedInTheSameRoom - room: {}", room);
                    LOGGER.info("labsStudentsGroupedInTheSameRoom - series: {}", group);
                    LOGGER.info("labsStudentsGroupedInTheSameRoom - studentTotal: {}", studentTotal);
                    LOGGER.info("-------------------------------");
                    return studentTotal > room.getCapacity();
                })
//                .penalize(HardSoftScore.ONE_HARD, ((timeslot, room, group, studentTotal) -> studentTotal - room.getCapacity()))
                .penalizeConfigurable((timeslot, room, group, studentTotal) -> (int) (studentTotal - room.getCapacity()))
                //.justifyWith()
                .asConstraint("labsStudentsGroupedInTheSameRoom");
    }

    Constraint coursesGroupedInTheSameTimeslot(ConstraintFactory constraintFactory) {

        return constraintFactory
                //select every Lesson
                .forEach(Lesson.class)
                // That is Course type
                .filter(lesson -> lesson.getLessonType().equals(LessonType.COURSE))
                // check if a lesson breaks "courses by student series" constraint
                .groupBy(
                        (lesson) -> lesson.getStudentGroup().getName(),
                        Lesson::getSubject,
                        countDistinct(lesson -> TimeslotRoom.ofTR(lesson.getTimeslot(), lesson.getRoom())))
                .filter((group, subject, timeslotAndRoomCount) -> timeslotAndRoomCount > 1)
                .penalizeConfigurable((group, subject, timeslotAndRoomCount) -> timeslotAndRoomCount - 1)
                //.justifyWith()
                .asConstraint("coursesGroupedInTheSameTimeslot");
    }

    Constraint seminarsGroupedInTheSameTimeslot(ConstraintFactory constraintFactory) {

        return constraintFactory
                //select every Lesson
                .forEach(Lesson.class)
                // That is Seminar type
                .filter(lesson -> lesson.getLessonType().equals(LessonType.SEMINAR))
                // check if a lesson breaks "seminars by student groups" constraint
                .groupBy(
                        (lesson) -> lesson.getStudentGroup().getStudentGroup(),
                        Lesson::getSubject,
                        countDistinct(lesson -> TimeslotRoom.ofTR(lesson.getTimeslot(), lesson.getRoom())))
                .filter((group, subject, timeslotAndRoomCount) -> timeslotAndRoomCount > 1)
                .penalizeConfigurable((group, subject, timeslotAndRoomCount) -> timeslotAndRoomCount - 1)
                //.justifyWith()
                .asConstraint("seminarsGroupedInTheSameTimeslot");
    }

    Constraint labsGroupedInTheSameTimeslot(ConstraintFactory constraintFactory) {

        return constraintFactory
                //select every Lesson
                .forEach(Lesson.class)
                // That is Laboratory type
                .filter(lesson -> lesson.getLessonType().equals(LessonType.LABORATORY))
                // check if a lesson breaks "laboratories by student groups where it is possible" constraint
                .groupBy(
                        (lesson) -> lesson.getStudentGroup().getStudentGroup(),
                        Lesson::getSubject,
                        countDistinct(lesson -> TimeslotRoom.ofTR(lesson.getTimeslot(), lesson.getRoom())))
                .filter((group, subject, timeslotAndRoomCount) -> timeslotAndRoomCount > 1)
                .penalizeConfigurable((group, subject, timeslotAndRoomCount) -> timeslotAndRoomCount - 1)
                //.justifyWith()
                .asConstraint("labsGroupedInTheSameTimeslot");
    }

    Constraint gapsLongerThan4Hours(ConstraintFactory constraintFactory) {
        // 4 hours gaps between lessons for students in the same day
        return constraintFactory
                //select each 2 pair of different lessons
                .forEach(Lesson.class)
                .join(Lesson.class,
                        //with the same student group
                        Joiners.equal(Lesson::getStudentGroup),
                        //in the same day
                        Joiners.equal((lesson) -> lesson.getTimeslot().getDayOfWeek()),
//                        Joiners.filtering((lesson1, lesson2) -> !lesson1.getTimeslot().equals(lesson2.getTimeslot())),
                        //// First starts before second
                        Joiners.lessThan((lesson -> lesson.getTimeslot().getId())))
                .ifNotExists(Lesson.class,
                        //with the same student group
                        Joiners.equal((a, b) -> a.getStudentGroup(), Lesson::getStudentGroup),
                        //in the same day
                        Joiners.equal((a, b) -> a.getTimeslot().getDayOfWeek(), (lesson) -> lesson.getTimeslot().getDayOfWeek()),
                        //is between the two timeslots
                        Joiners.lessThan((a, b) -> a.getTimeslot().getStartTime(), (lesson) -> lesson.getTimeslot().getStartTime()),
                        Joiners.greaterThan((a, b) -> b.getTimeslot().getStartTime(), (lesson) -> lesson.getTimeslot().getStartTime())
                )
                .filter((lesson1, lesson2) -> {
//                    LOGGER.info("The lesson1's: {}", lesson1);
                    LOGGER.info("gapsLongerThan4Hours - The lesson1's timeslot: {}", lesson1.getTimeslot());
//                    LOGGER.info("The lesson2: {}", lesson2);
                    LOGGER.info("gapsLongerThan4Hours - The lesson2's timeslot: {}", lesson2.getTimeslot());
                    LOGGER.info("----------------------------------");
                    Duration between = Duration.between(lesson1.getTimeslot().getEndTime(),
                            lesson2.getTimeslot().getStartTime());
                    return !between.isNegative() && between.compareTo(Duration.ofHours(3)) > 0;
                })
//                .penalize(HardSoftScore.ONE_SOFT)
                .penalizeConfigurable()
                //.justifyWith()
                .asConstraint("gapsLongerThan4Hours");
    }

    Constraint teacherRoomStability(ConstraintFactory constraintFactory) {
        // A teacher prefers to teach in a single room.
        return constraintFactory
                //select each 2 pair of *different* lessons
                .forEachUniquePair(Lesson.class,
                        //with the same teacher
                        Joiners.equal(Lesson::getTeacher)
                )
                .filter((lesson1, lesson2) -> {
                    Duration between = Duration.between(lesson1.getTimeslot().getEndTime(),
                            lesson2.getTimeslot().getStartTime());
                    boolean consecutiveLessons = !between.isNegative()
                            && between.compareTo(Duration.ofMinutes(30)) <= 0;
                    return consecutiveLessons && lesson1.getRoom().equals(lesson2.getRoom())
                            && lesson1.getTimeslot().equals(lesson2.getTimeslot());
                })
                .rewardConfigurable()
                .justifyWith((lesson1, lesson2, score) -> new TeacherRoomStabilityJustification(lesson1.getTeacher(), lesson1, lesson2))
                .asConstraint("teacherRoomStability");
    }

    Constraint teacherTimeEfficiency(ConstraintFactory constraintFactory) {
        // A teacher prefers to teach sequential lessons and dislikes gaps between lessons.
        return constraintFactory
                //select each 2 pair of different lessons
                .forEachUniquePair(Lesson.class,
                        //with the same teacher
                        Joiners.equal(Lesson::getTeacher),
                        // in the same day
                        Joiners.equal((lesson) -> lesson.getTimeslot().getDayOfWeek()))
                .filter((lesson1, lesson2) -> {
                    Duration between = Duration.between(lesson1.getTimeslot().getEndTime(),
                            lesson2.getTimeslot().getStartTime());
                    return !between.isNegative() && between.compareTo(Duration.ofMinutes(30)) <= 0;
                })
//                .reward(HardSoftScore.ONE_SOFT)
                .rewardConfigurable()
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
                        Joiners.equal(Lesson::getStudentGroup),
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
                .penalizeConfigurable()
//                .penalize(HardSoftScore.ONE_SOFT)
                .justifyWith((lesson1, lesson2, score) -> new StudentGroupSubjectVarietyJustification(lesson1.getStudentGroup(), lesson1, lesson2))
                .asConstraint("studentGroupVariety");
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

    private long calculateTimeslotDuration(Timeslot timeslot) {
        Duration duration = Duration.between(timeslot.getStartTime(), timeslot.getEndTime());
        LOGGER.info("the duration of timeslot {} is: {}", timeslot, duration.abs().toHours());
        return duration.abs().toHours();
    }

    private boolean isTeacherAssignedToPreferredTimeslot(Lesson lesson) {
        Timeslot timeslot = lesson.getTimeslot();
        Set<TeacherTimeslot> preferredTimeslots = lesson.getTeacher().getPreferredTimeslots();
        if (preferredTimeslots.isEmpty()) {
            return true; // No preferred timeslots, so no penalty
        }

        for (TeacherTimeslot preferredTimeslot : preferredTimeslots) {
            if (preferredTimeslot.getDayOfWeek().equals(timeslot.getDayOfWeek()) &&
                    timeslot.getStartTime().compareTo(preferredTimeslot.getStartTime()) >= 0 &&
                    timeslot.getEndTime().compareTo(preferredTimeslot.getEndTime()) <= 0) {
                return true; // The lesson's timeslot is within the preferred timeslot
            }
        }
        return false;
    }
}
