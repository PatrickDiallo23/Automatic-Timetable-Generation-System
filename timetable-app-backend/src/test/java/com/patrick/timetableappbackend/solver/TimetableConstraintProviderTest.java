package com.patrick.timetableappbackend.solver;

import ai.timefold.solver.test.api.score.stream.ConstraintVerifier;

import com.patrick.timetableappbackend.config.ConstraintConfig;
import com.patrick.timetableappbackend.model.Lesson;
import com.patrick.timetableappbackend.model.LessonType;
import com.patrick.timetableappbackend.model.Room;
import com.patrick.timetableappbackend.model.StudentGroup;
import com.patrick.timetableappbackend.model.Teacher;
import com.patrick.timetableappbackend.model.TeacherTimeslot;
import com.patrick.timetableappbackend.model.Timeslot;
import com.patrick.timetableappbackend.model.Timetable;
import com.patrick.timetableappbackend.model.Year;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.Set;

@SpringBootTest(
    webEnvironment = SpringBootTest.WebEnvironment.NONE,
    classes = ConstraintConfig.class
)
public class TimetableConstraintProviderTest {

    private static final Room ROOM1 = new Room(1, "Room1");
    private static final Room ROOM2 = new Room(2, "Room2");
    private static final Timeslot TIMESLOT1 = new Timeslot(1, DayOfWeek.MONDAY, LocalTime.NOON);
    private static final Timeslot TIMESLOT2 = new Timeslot(2, DayOfWeek.TUESDAY, LocalTime.NOON);
    private static final Timeslot TIMESLOT3 = new Timeslot(3, DayOfWeek.TUESDAY, LocalTime.NOON.plusMinutes(150));
    private static final Timeslot TIMESLOT4 = new Timeslot(4, DayOfWeek.TUESDAY, LocalTime.NOON.plusHours(3));
    private static final Timeslot TIMESLOT5 = new Timeslot(5, DayOfWeek.TUESDAY, LocalTime.NOON.plusHours(5));
    private static final Timeslot TIMESLOT6 = new Timeslot(6, DayOfWeek.TUESDAY, LocalTime.NOON.plusHours(7));
    private static final Timeslot TIMESLOT7 = new Timeslot(7, DayOfWeek.TUESDAY, LocalTime.NOON.plusHours(9));

    @Autowired
    ConstraintVerifier<TimetableConstraintProvider, Timetable> constraintVerifier;

    @Test
    void roomConflict() {

        Lesson firstLesson = new Lesson(1, "Subject1", new Teacher(1L, "Teacher1", null), new StudentGroup(1L, "Group1", 30L), TIMESLOT1, ROOM1);
        Lesson conflictingLesson = new Lesson(2, "Subject2", new Teacher(2L, "Teacher2", null), new StudentGroup(2L, "Group2", 30L), TIMESLOT1, ROOM1);
        Lesson nonConflictingLesson = new Lesson(3, "Subject3", new Teacher(3L, "Teacher3", null), new StudentGroup(3L, "Group3", 30L), TIMESLOT2, ROOM1);

        constraintVerifier.verifyThat(TimetableConstraintProvider::roomConflict)
                .given(firstLesson, conflictingLesson, nonConflictingLesson)
                .penalizesBy(1);
    }

    @Test
    void roomConflictUniversity() {

        //test more use cases
        Lesson firstLesson = new Lesson(1, "Subject1", LessonType.COURSE, new Teacher(1L, "Teacher1", null), new StudentGroup(1L, Year.FIRST, "Group1", "1", 30L), TIMESLOT1, ROOM1);
        Lesson conflictingLesson = new Lesson(2, "Subject1", LessonType.LABORATORY, new Teacher(2L, "Teacher2", null), new StudentGroup(2L, Year.FIRST, "Group1", "1", 30L), TIMESLOT1, ROOM1);
        Lesson nonConflictingLesson = new Lesson(3, "Subject3", LessonType.SEMINAR, new Teacher(3L, "Teacher3", null), new StudentGroup(3L, Year.FIRST, "Group1", "1", 30L), TIMESLOT2, ROOM1);
        Lesson conflictingLesson2 = new Lesson(4, "Subject4", LessonType.SEMINAR, new Teacher(4L, "Teacher4", null), new StudentGroup(4L, Year.FIRST, "Group1", "1", 30L), TIMESLOT2, ROOM1);

        constraintVerifier.verifyThat(TimetableConstraintProvider::roomConflictUniversity)
                .given(firstLesson, conflictingLesson, nonConflictingLesson, conflictingLesson2)
                .penalizesBy(2);
    }

    @Test
    void teacherConflict() {

        Teacher conflictingTeacher = new Teacher(1L, "Teacher1", null);

        Lesson firstLesson = new Lesson(1, "Subject1", conflictingTeacher, new StudentGroup(1L, "Group1", 30L), TIMESLOT1, ROOM1);
        Lesson conflictingLesson = new Lesson(2, "Subject2", conflictingTeacher, new StudentGroup(2L, "Group2", 30L), TIMESLOT1, ROOM2);
        Lesson nonConflictingLesson = new Lesson(3, "Subject3", new Teacher(2L, "Teacher2", null), new StudentGroup(3L, "Group3", 30L), TIMESLOT2, ROOM1);

        constraintVerifier.verifyThat(TimetableConstraintProvider::teacherConflict)
                .given(firstLesson, conflictingLesson, nonConflictingLesson)
                .penalizesBy(1);
    }

    @Test
    void teacherConflictUniversity() {

        //Todo: test more cases
        Teacher conflictingTeacher = new Teacher(1L, "Teacher1", null);

        Lesson firstLesson = new Lesson(1, "Subject1", LessonType.SEMINAR, conflictingTeacher, new StudentGroup(1L, Year.FIRST, "Group1", "1A", 30L), TIMESLOT1, ROOM1);
        Lesson conflictingLesson = new Lesson(2, "Subject1", LessonType.SEMINAR, conflictingTeacher, new StudentGroup(2L, Year.FIRST, "Group1", "1A", 30L), TIMESLOT1, ROOM1);
        Lesson nonConflictingLesson = new Lesson(3, "Subject3", LessonType.COURSE, new Teacher(2L, "Teacher2", null), new StudentGroup(3L, "Group3", 30L), TIMESLOT2, ROOM1);

        constraintVerifier.verifyThat(TimetableConstraintProvider::teacherConflictUniversity)
                .given(firstLesson, conflictingLesson, nonConflictingLesson)
                .penalizesBy(0);
    }

    @Test
    void studentGroupConflict() {

        StudentGroup conflictingGroup = new StudentGroup(1L, "Group1", 30L);

        Lesson firstLesson = new Lesson(1, "Subject1", new Teacher(1L, "Teacher1", null), conflictingGroup, TIMESLOT1, ROOM1);
        Lesson conflictingLesson = new Lesson(2, "Subject2", new Teacher(2L, "Teacher2", null), conflictingGroup, TIMESLOT1, ROOM2);
        Lesson nonConflictingLesson = new Lesson(3, "Subject3", new Teacher(3L, "Teacher3", null), new StudentGroup(3L, "Group3", 30L), TIMESLOT2, ROOM1);

        constraintVerifier.verifyThat(TimetableConstraintProvider::studentGroupConflictWithGroupBy)
                .given(firstLesson, conflictingLesson, nonConflictingLesson)
                .penalizesBy(1);
    }

    @Test
    void teacherRoomStability() {

        Teacher teacher = new Teacher(1L, "Teacher1", null);

        Lesson lessonInFirstRoom = new Lesson(1, "Subject1", teacher, new StudentGroup(1L, "Group1", 30L), TIMESLOT1, ROOM1);
        Lesson lessonInSameRoom = new Lesson(2, "Subject2", teacher, new StudentGroup(2L, "Group2", 30L), TIMESLOT1, ROOM1);
        Lesson lessonInDifferentRoom = new Lesson(3, "Subject3", teacher, new StudentGroup(3L, "Group3", 30L), TIMESLOT2, ROOM2);
        Lesson lesson2InDifferentRoom = new Lesson(4, "Subject3", teacher, new StudentGroup(4L, "Group3", 30L), TIMESLOT2, ROOM2);

        constraintVerifier.verifyThat(TimetableConstraintProvider::teacherRoomStability)
                .given(lessonInFirstRoom, lessonInDifferentRoom, lessonInSameRoom, lesson2InDifferentRoom)
                .rewardsWith(0);
    }

    @Test
    void teacherTimeEfficiency() {

        Teacher teacher = new Teacher(1L, "Teacher1", null);

        Lesson singleLessonOnMonday = new Lesson(1, "Subject1", teacher, new StudentGroup(1L, "Group1", 30L), TIMESLOT1, ROOM1);
        Lesson firstTuesdayLesson = new Lesson(2, "Subject2", teacher, new StudentGroup(2L, "Group2", 30L), TIMESLOT2, ROOM1);
        Lesson secondTuesdayLesson = new Lesson(3, "Subject3", teacher, new StudentGroup(3L, "Group3", 30L), TIMESLOT3, ROOM1);
        Lesson thirdTuesdayLessonWithGap = new Lesson(4, "Subject4", teacher, new StudentGroup(4L, "Group4", 30L), TIMESLOT4, ROOM1);

        constraintVerifier.verifyThat(TimetableConstraintProvider::teacherTimeEfficiency)
                .given(singleLessonOnMonday, firstTuesdayLesson, secondTuesdayLesson, thirdTuesdayLessonWithGap)
                .rewardsWith(1);
    }

    @Test
    void studentGroupSubjectVariety() {

        StudentGroup studentGroup = new StudentGroup(1L, "Group1", 30L);
        String repeatedSubject = "Subject1";

        Lesson mondayLesson = new Lesson(1, repeatedSubject, new Teacher(1L, "Teacher1", null), studentGroup, TIMESLOT1, ROOM1);
        Lesson firstTuesdayLesson = new Lesson(2, repeatedSubject, new Teacher(2L, "Teacher2", null), studentGroup, TIMESLOT2, ROOM1);
        Lesson secondTuesdayLesson = new Lesson(3, repeatedSubject, new Teacher(3L, "Teacher3", null), studentGroup, TIMESLOT3, ROOM1);
        Lesson thirdTuesdayLessonWithDifferentSubject = new Lesson(4, "Subject2", new Teacher(4L, "Teacher4", null), studentGroup, TIMESLOT4, ROOM1);
        Lesson lessonInAnotherGroup = new Lesson(5, repeatedSubject, new Teacher(5L, "Teacher5", null), new StudentGroup(2L, "Group2", 30L), TIMESLOT1, ROOM1);

        constraintVerifier.verifyThat(TimetableConstraintProvider::studentGroupSubjectVariety)
                .given(mondayLesson, firstTuesdayLesson, secondTuesdayLesson, thirdTuesdayLessonWithDifferentSubject,
                        lessonInAnotherGroup)
                .penalizesBy(1);
    }

    @Test
    void teacherPreferences() {

        // We will use teacher's preferences as the teacher's availability
        StudentGroup studentGroup = new StudentGroup(1L, "Group1", 30L);
        StudentGroup studentGroup2 = new StudentGroup(2L, "Group1", 30L);
        String repeatedSubject = "Subject1";
        Timeslot timeslot1 = new Timeslot(3L, DayOfWeek.TUESDAY, LocalTime.of(8, 0), LocalTime.of(10, 0));
        Timeslot timeslot3 = new Timeslot(4L, DayOfWeek.TUESDAY, LocalTime.of(14, 0), LocalTime.of(16, 0));
        TeacherTimeslot teacherPreferredTimeslot1 = new TeacherTimeslot(DayOfWeek.TUESDAY, LocalTime.of(9, 0), LocalTime.of(16, 0));
        TeacherTimeslot teacherPreferredTimeslot2 = new TeacherTimeslot(DayOfWeek.TUESDAY, LocalTime.of(10, 0), LocalTime.of(16, 0));

        Lesson mondayLesson = new Lesson(1, repeatedSubject, new Teacher(1L, "Teacher1", Set.of()), studentGroup, TIMESLOT1, ROOM1);
        Lesson firstTuesdayLesson = new Lesson(2, repeatedSubject, new Teacher(2L, "Teacher2", Set.of(teacherPreferredTimeslot1)), studentGroup, timeslot1, ROOM1);
        Lesson secondTuesdayLesson = new Lesson(3, repeatedSubject, new Teacher(3L, "Teacher3", Set.of(teacherPreferredTimeslot2)), studentGroup, TIMESLOT2, ROOM1);
        Lesson thirdTuesdayLesson = new Lesson(4, repeatedSubject, new Teacher(3L, "Teacher3", Set.of(teacherPreferredTimeslot2)), studentGroup2, timeslot3, ROOM1);
        Lesson fourthTuesdayLesson = new Lesson(5, repeatedSubject, new Teacher(3L, "Teacher3", Set.of(teacherPreferredTimeslot2)), studentGroup2, TIMESLOT2, ROOM1);

        constraintVerifier.verifyThat(TimetableConstraintProvider::maximizePreferredTimeslotAssignments)
                .given(mondayLesson, firstTuesdayLesson, secondTuesdayLesson, thirdTuesdayLesson, fourthTuesdayLesson)
                .penalizesBy(1);
    }

    @Test
    void maximmumCoursesForStudents() {

        StudentGroup studentGroup = new StudentGroup(1L, "Group1", 30L);
        StudentGroup studentGroup2 = new StudentGroup(2L, "Group2", 30L);

        Timeslot timeslot = new Timeslot(8L, DayOfWeek.MONDAY, LocalTime.NOON.plusHours(2));
        Timeslot timeslot8 = new Timeslot(8L, DayOfWeek.TUESDAY, LocalTime.NOON.plusHours(11));
        TeacherTimeslot preferredTimeslot = new TeacherTimeslot(DayOfWeek.TUESDAY, LocalTime.NOON.plusMinutes(150));

        Lesson mondayLesson = new Lesson(1, "subject1", new Teacher(1L, "Teacher1", null), studentGroup, 2, TIMESLOT1, ROOM1);
        Lesson secondLesson = new Lesson(11, "subject1", new Teacher(1L, "Teacher1", null), studentGroup, 2, timeslot, ROOM1);
        Lesson firstTuesdayLesson = new Lesson(2, "subject2", new Teacher(2L, "Teacher2", Set.of(preferredTimeslot)), studentGroup, 2, TIMESLOT2, ROOM1);
        Lesson tuesdayLesson = new Lesson(3, "subject3", new Teacher(3L, "Teacher3", null), studentGroup2, 2, TIMESLOT3, ROOM1);
        Lesson secondTuesdayLesson = new Lesson(4, "subject1", new Teacher(1L, "Teacher1", null), studentGroup, 2, TIMESLOT3, ROOM1);
        Lesson thirdTuesdayLesson = new Lesson(5, "subject2", new Teacher(2L, "Teacher2", Set.of(preferredTimeslot)), studentGroup, 2, TIMESLOT4, ROOM1);
        Lesson tuesdayLesson1 = new Lesson(6, "subject3", new Teacher(3L, "Teacher3", null), studentGroup2, 2, TIMESLOT4, ROOM1);
        Lesson fourthTuesdayLesson = new Lesson(7, "subject1", new Teacher(1L, "Teacher1", null), studentGroup, 2, TIMESLOT5, ROOM1);
        Lesson tuesdayLesson2 = new Lesson(8, "subject2", new Teacher(2L, "Teacher2", Set.of(preferredTimeslot)), studentGroup2, 2, TIMESLOT2, ROOM1);
        Lesson fifthTuesdayLesson = new Lesson(9, "subject3", new Teacher(3L, "Teacher3", null), studentGroup, 2, TIMESLOT6, ROOM1);
        Lesson sixthTuesdayLesson = new Lesson(10, "subject4", new Teacher(3L, "Teacher3", null), studentGroup, 2, TIMESLOT7, ROOM1);

        constraintVerifier.verifyThat(TimetableConstraintProvider::maximumCoursesForStudents)
                .given(mondayLesson, secondLesson, firstTuesdayLesson, tuesdayLesson, secondTuesdayLesson, thirdTuesdayLesson,
                        tuesdayLesson1, fourthTuesdayLesson, tuesdayLesson2, fifthTuesdayLesson, sixthTuesdayLesson)
                .penalizesBy(2);
    }

    @Test
    void tooMuchGap() {

        StudentGroup studentGroup = new StudentGroup(1L, "Group1", 30L);

        Lesson firstTuesdayLesson = new Lesson(2, "subject2", new Teacher(2L, "Teacher2", null), studentGroup, TIMESLOT2, ROOM1);
        Lesson secondTuesdayLesson = new Lesson(3, "subject1", new Teacher(1L, "Teacher1", null), studentGroup, TIMESLOT3, ROOM1);
        Lesson thirdTuesdayLesson = new Lesson(4, "subject2", new Teacher(2L, "Teacher2", null), studentGroup, TIMESLOT4, ROOM1);
//        Lesson fifthTuesdayLesson = new Lesson(5, "subject3", new Teacher(3L, "Teacher3", null), studentGroup, TIMESLOT6, ROOM1);
        Lesson sixthTuesdayLesson = new Lesson(6, "subject4", new Teacher(3L, "Teacher3", null), studentGroup, TIMESLOT7, ROOM1);

        constraintVerifier.verifyThat(TimetableConstraintProvider::gapsLongerThan4Hours)
                .given(firstTuesdayLesson, secondTuesdayLesson, thirdTuesdayLesson, sixthTuesdayLesson)
                .penalizesBy(2);
    }

    @Test
    void capacityRoomConflict() {

        StudentGroup studentGroup = new StudentGroup(1L, "Group1", 30L);
        StudentGroup studentGroup2 = new StudentGroup(2L, "Group1", 30L);

        Room room = new Room(1L, "sala1", 60L);

        Lesson firstTuesdayLesson = new Lesson(1, "subject1", new Teacher(1L, "Teacher1", null), studentGroup, TIMESLOT2, room);
        Lesson secondTuesdayLesson = new Lesson(2, "subject1", new Teacher(1L, "Teacher1", null), studentGroup2, TIMESLOT2, room);

        constraintVerifier.verifyThat(TimetableConstraintProvider::capacityRoomConflict)
                .given(firstTuesdayLesson, secondTuesdayLesson)
                .penalizesBy(0);
    }

    @Test
    void studentGroupedInTheSameRoom() {

        StudentGroup studentGroup = new StudentGroup(1L, "Group1", 30L);
        StudentGroup studentGroup2 = new StudentGroup(2L, "Group1", 30L);
        StudentGroup studentGroup3 = new StudentGroup(3L, "Group2", 30L);

        Room room = new Room(1L, "sala1", 60L);

        Lesson firstTuesdayLesson = new Lesson(1, "subject1", LessonType.COURSE, new Teacher(1L, "Teacher1", null), studentGroup, TIMESLOT2, room);
        Lesson secondTuesdayLesson = new Lesson(2, "subject1", LessonType.COURSE, new Teacher(1L, "Teacher1", null), studentGroup2, TIMESLOT2, room);
        Lesson thirdTuesdayLesson = new Lesson(3, "subject1", LessonType.LABORATORY, new Teacher(1L, "Teacher1", null), studentGroup3, TIMESLOT3, room);

        constraintVerifier.verifyThat(TimetableConstraintProvider::courseStudentsGroupedInTheSameRoom)
                .given(firstTuesdayLesson, secondTuesdayLesson, thirdTuesdayLesson)
                .penalizesBy(0);
    }

    @Test
    void studentSeminarGroupedInTheSameRoom() {

        StudentGroup studentGroup = new StudentGroup(1L, Year.FIRST, "Group1", "1G", 30L);
        StudentGroup studentGroup2 = new StudentGroup(2L, Year.FIRST, "Group1", "1G", 30L);
        StudentGroup studentGroup3 = new StudentGroup(3L, Year.FIRST, "Group2", "2G", 30L);

        Room room = new Room(1L, "sala1", 60L);

        Lesson firstTuesdayLesson = new Lesson(1, "subject1", LessonType.SEMINAR, new Teacher(1L, "Teacher1", null), studentGroup, TIMESLOT2, room);
        Lesson secondTuesdayLesson = new Lesson(2, "subject1", LessonType.SEMINAR, new Teacher(1L, "Teacher1", null), studentGroup2, TIMESLOT2, room);
        Lesson thirdTuesdayLesson = new Lesson(3, "subject1", LessonType.LABORATORY, new Teacher(1L, "Teacher1", null), studentGroup3, TIMESLOT3, room);

        constraintVerifier.verifyThat(TimetableConstraintProvider::seminarStudentsGroupedInTheSameRoom)
                .given(firstTuesdayLesson, secondTuesdayLesson, thirdTuesdayLesson)
                .penalizesBy(0);
    }

    @Test
    void studentLaboratoryGroupedInTheSameRoom() {

        StudentGroup studentGroup = new StudentGroup(1L, Year.FIRST, "Group1", "1G", 30L);
        StudentGroup studentGroup2 = new StudentGroup(2L, Year.FIRST, "Group1", "1G", 30L);
        StudentGroup studentGroup4 = new StudentGroup(4L, Year.FIRST, "Group1", "1G", 30L);
        StudentGroup studentGroup3 = new StudentGroup(3L, Year.FIRST, "Group2", "2G", 30L);

        Room room = new Room(1L, "sala1", 60L);
        Room room1 = new Room(2L, "sala2", 60L);

        Lesson firstTuesdayLesson = new Lesson(1, "subject1", LessonType.LABORATORY, new Teacher(1L, "Teacher1", null), studentGroup, TIMESLOT2, room);
        Lesson secondTuesdayLesson = new Lesson(2, "subject1", LessonType.LABORATORY, new Teacher(1L, "Teacher1", null), studentGroup2, TIMESLOT2, room1);
        Lesson fourthTuesdayLesson = new Lesson(4, "subject1", LessonType.LABORATORY, new Teacher(1L, "Teacher1", null), studentGroup4, TIMESLOT2, room);
        Lesson thirdTuesdayLesson = new Lesson(3, "subject1", LessonType.LABORATORY, new Teacher(1L, "Teacher1", null), studentGroup3, TIMESLOT3, room);

        constraintVerifier.verifyThat(TimetableConstraintProvider::labsStudentsGroupedInTheSameRoom)
                .given(firstTuesdayLesson, secondTuesdayLesson, thirdTuesdayLesson, fourthTuesdayLesson)
                .penalizesBy(0);
    }

    @Test
    void coursesGroupedInTheSameTimeslot() {

        StudentGroup studentGroup = new StudentGroup(1L, Year.FIRST, "Group1", "1G", 30L);
        StudentGroup studentGroup2 = new StudentGroup(2L, Year.FIRST, "Group1", "1G", 30L);
        StudentGroup studentGroup4 = new StudentGroup(4L, Year.FIRST, "Group1", "1G", 30L);
        StudentGroup studentGroup3 = new StudentGroup(3L, Year.FIRST, "Group2", "2G", 30L);

        Room room = new Room(1L, "sala1", 60L);
        Room room1 = new Room(2L, "sala2", 60L);

        Lesson firstTuesdayLesson = new Lesson(1, "subject1", LessonType.COURSE, new Teacher(1L, "Teacher1", null), studentGroup, TIMESLOT2, room);
        Lesson secondTuesdayLesson = new Lesson(2, "subject1", LessonType.COURSE, new Teacher(1L, "Teacher1", null), studentGroup2, TIMESLOT2, room1);

        constraintVerifier.verifyThat(TimetableConstraintProvider::coursesGroupedInTheSameTimeslot)
                .given(firstTuesdayLesson, secondTuesdayLesson)
                .penalizesBy(1);
    }

    @Test
    void seminarGroupedInTheSameTimeslot() {

        StudentGroup studentGroup = new StudentGroup(1L, Year.FIRST, "Group1", "1G", 30L);
        StudentGroup studentGroup2 = new StudentGroup(2L, Year.FIRST, "Group1", "1G", 30L);
        StudentGroup studentGroup4 = new StudentGroup(4L, Year.FIRST, "Group1", "1G", 30L);
        StudentGroup studentGroup3 = new StudentGroup(3L, Year.FIRST, "Group2", "2G", 30L);

        Room room = new Room(1L, "sala1", 60L);
        Room room1 = new Room(2L, "sala2", 60L);

        Lesson firstTuesdayLesson = new Lesson(1, "subject1", LessonType.SEMINAR, new Teacher(1L, "Teacher1", null), studentGroup, TIMESLOT2, room);
        Lesson secondTuesdayLesson = new Lesson(2, "subject1", LessonType.SEMINAR, new Teacher(1L, "Teacher1", null), studentGroup2, TIMESLOT3, room);
        Lesson thirdTuesdayLesson = new Lesson(3, "subject1", LessonType.SEMINAR, new Teacher(1L, "Teacher1", null), studentGroup4, TIMESLOT3, room);
        Lesson fourthTuesdayLesson = new Lesson(4, "subject1", LessonType.SEMINAR, new Teacher(1L, "Teacher1", null), studentGroup4, TIMESLOT3, room);
        Lesson fifthTuesdayLesson = new Lesson(5, "subject1", LessonType.SEMINAR, new Teacher(1L, "Teacher1", null), studentGroup2, TIMESLOT3, room);

        constraintVerifier.verifyThat(TimetableConstraintProvider::seminarsGroupedInTheSameTimeslot)
                .given(firstTuesdayLesson, secondTuesdayLesson, thirdTuesdayLesson, fourthTuesdayLesson, fifthTuesdayLesson)
                .penalizesBy(1);
    }

    @Test
    void labsGroupedInTheSameTimeslot() {

        StudentGroup studentGroup = new StudentGroup(1L, Year.FIRST, "Group1", "1G", 30L);
        StudentGroup studentGroup2 = new StudentGroup(2L, Year.FIRST, "Group1", "1G", 30L);
        StudentGroup studentGroup4 = new StudentGroup(4L, Year.FIRST, "Group1", "1G", 30L);
        StudentGroup studentGroup3 = new StudentGroup(3L, Year.FIRST, "Group2", "2G", 30L);

        Room room = new Room(1L, "sala1", 60L);
        Room room1 = new Room(2L, "sala2", 60L);

        Lesson firstTuesdayLesson = new Lesson(1, "subject1", LessonType.LABORATORY, new Teacher(1L, "Teacher1", null), studentGroup, TIMESLOT2, room);
        Lesson secondTuesdayLesson = new Lesson(2, "subject1", LessonType.LABORATORY, new Teacher(1L, "Teacher1", null), studentGroup2, TIMESLOT3, room);

        constraintVerifier.verifyThat(TimetableConstraintProvider::labsGroupedInTheSameTimeslot)
                .given(firstTuesdayLesson, secondTuesdayLesson)
                .penalizesBy(1);
    }

    @Test
    void maximmumCoursesTeached() {

        StudentGroup studentGroup = new StudentGroup(1L, "Group1", 30L);
        StudentGroup studentGroup2 = new StudentGroup(2L, "Group1", 30L);
        StudentGroup studentGroup3 = new StudentGroup(3L, "Group2", 30L);

        Timeslot timeslot = new Timeslot(8L, DayOfWeek.WEDNESDAY, LocalTime.NOON);
        Timeslot timeslot2 = new Timeslot(9L, DayOfWeek.WEDNESDAY, LocalTime.NOON.plusHours(2));
        Timeslot timeslot3 = new Timeslot(10L, DayOfWeek.WEDNESDAY, LocalTime.NOON.plusHours(4));
        Timeslot timeslot4 = new Timeslot(11L, DayOfWeek.WEDNESDAY, LocalTime.NOON.plusHours(6));
        Timeslot timeslot5 = new Timeslot(12L, DayOfWeek.WEDNESDAY, LocalTime.NOON.plusHours(8));

        Room room = new Room(1L, "sala1", 60L);

        Lesson firstTuesdayLesson = new Lesson(1, "subject1", LessonType.COURSE, new Teacher(1L, "Teacher1", null), studentGroup, TIMESLOT2, room);
        Lesson secondTuesdayLesson = new Lesson(2, "subject1", LessonType.COURSE, new Teacher(1L, "Teacher1", null), studentGroup2, TIMESLOT2, room);
        Lesson tuesdayLesson = new Lesson(3, "subject1", LessonType.COURSE, new Teacher(1L, "Teacher1", null), studentGroup3, TIMESLOT2, room);
        Lesson thirdTuesdayLesson = new Lesson(4, "subject1", LessonType.COURSE, new Teacher(1L, "Teacher1", null), studentGroup3, TIMESLOT3, room);
        Lesson fourthTuesdayLesson = new Lesson(6, "subject1", LessonType.COURSE, new Teacher(1L, "Teacher1", null), studentGroup, TIMESLOT3, room);
        Lesson anotherTuesdayLesson = new Lesson(5, "subject1", LessonType.COURSE, new Teacher(1L, "Teacher1", null), studentGroup3, TIMESLOT4, room);
        Lesson fifthTuesdayLesson = new Lesson(7, "subject1", LessonType.LABORATORY, new Teacher(1L, "Teacher1", null), studentGroup2, TIMESLOT5, room);
        Lesson sixthTuesdayLesson = new Lesson(8, "subject1", LessonType.SEMINAR, new Teacher(1L, "Teacher1", null), studentGroup3, TIMESLOT6, room);
        Lesson seventhTuesdayLesson = new Lesson(9, "subject1", LessonType.SEMINAR, new Teacher(1L, "Teacher1", null), studentGroup3, TIMESLOT7, room);
        Lesson eightTuesdayLesson = new Lesson(10, "subject1", LessonType.SEMINAR, new Teacher(1L, "Teacher1", null), studentGroup3, timeslot, room);
        Lesson ninethTuesdayLesson = new Lesson(11, "subject1", LessonType.SEMINAR, new Teacher(1L, "Teacher1", null), studentGroup3, timeslot2, room);
        Lesson tenthTuesdayLesson = new Lesson(12, "subject1", LessonType.SEMINAR, new Teacher(1L, "Teacher1", null), studentGroup3, timeslot3, room);
        Lesson eleventhTuesdayLesson = new Lesson(13, "subject1", LessonType.SEMINAR, new Teacher(1L, "Teacher1", null), studentGroup3, timeslot4, room);
        Lesson twelvethTuesdayLesson = new Lesson(14, "subject1", LessonType.SEMINAR, new Teacher(1L, "Teacher1", null), studentGroup3, timeslot5, room);
        Lesson tuesday13Lesson = new Lesson(15, "subject1", LessonType.SEMINAR, new Teacher(2L, "Teacher1", null), studentGroup3, timeslot3, room);
        Lesson tuesday14Lesson = new Lesson(16, "subject1", LessonType.SEMINAR, new Teacher(2L, "Teacher1", null), studentGroup3, timeslot4, room);
        Lesson tuesday15Lesson = new Lesson(17, "subject1", LessonType.SEMINAR, new Teacher(2L, "Teacher1", null), studentGroup3, timeslot5, room);

        constraintVerifier.verifyThat(TimetableConstraintProvider::maximmumCoursesTeached)
                .given(firstTuesdayLesson, secondTuesdayLesson, tuesdayLesson, thirdTuesdayLesson, anotherTuesdayLesson,
                        fourthTuesdayLesson, fifthTuesdayLesson, sixthTuesdayLesson, seventhTuesdayLesson,
                        eightTuesdayLesson, ninethTuesdayLesson, tenthTuesdayLesson, eleventhTuesdayLesson,
                        twelvethTuesdayLesson, tuesday13Lesson, tuesday14Lesson, tuesday15Lesson)
                .penalizesBy(0);
    }

    @Test
    void overlappingTimeslots() {

        StudentGroup studentGroup3 = new StudentGroup(3L, "Group2", 30L);

        Timeslot timeslot = new Timeslot(8L, DayOfWeek.WEDNESDAY, LocalTime.NOON);
        Timeslot timeslot2 = new Timeslot(9L, DayOfWeek.WEDNESDAY, LocalTime.NOON, LocalTime.NOON.plusHours(1));
        Timeslot timeslot3 = new Timeslot(10L, DayOfWeek.WEDNESDAY, LocalTime.NOON.plusHours(4));
        Timeslot timeslot4 = new Timeslot(11L, DayOfWeek.WEDNESDAY, LocalTime.NOON.plusHours(4), LocalTime.NOON.plusHours(5));
        Timeslot timeslot5 = new Timeslot(12L, DayOfWeek.WEDNESDAY, LocalTime.NOON.plusHours(8));
        Timeslot timeslot6 = new Timeslot(12L, DayOfWeek.WEDNESDAY, LocalTime.NOON.plusHours(7), LocalTime.NOON.plusHours(10));

        Room room = new Room(1L, "sala1", 60L);

        Lesson eightTuesdayLesson = new Lesson(1, "subject1", LessonType.SEMINAR, new Teacher(1L, "Teacher1", null), studentGroup3, timeslot, room);
        Lesson ninethTuesdayLesson = new Lesson(2, "subject1", LessonType.SEMINAR, new Teacher(1L, "Teacher1", null), studentGroup3, timeslot2, room);
        Lesson tenthTuesdayLesson = new Lesson(3, "subject1", LessonType.SEMINAR, new Teacher(1L, "Teacher1", null), studentGroup3, timeslot3, room);
        Lesson eleventhTuesdayLesson = new Lesson(4, "subject1", LessonType.SEMINAR, new Teacher(1L, "Teacher1", null), studentGroup3, timeslot4, room);
        Lesson twelvethTuesdayLesson = new Lesson(5, "subject1", LessonType.SEMINAR, new Teacher(1L, "Teacher1", null), studentGroup3, timeslot5, room);
        Lesson nextLesson = new Lesson(6, "subject1", LessonType.SEMINAR, new Teacher(1L, "Teacher1", null), studentGroup3, timeslot6, room);

        constraintVerifier.verifyThat(TimetableConstraintProvider::overlappingTimeslot)
                .given(eightTuesdayLesson, ninethTuesdayLesson, tenthTuesdayLesson, eleventhTuesdayLesson,
                        twelvethTuesdayLesson, nextLesson)
                .penalizesBy(3);
    }

    @Test
    void coursesInTheSameBuilding() {

        StudentGroup studentGroup = new StudentGroup(1L, "Group1", 30L);

        Room room = new Room(1L, "sala1", 60L, "Precis");
        Room room2 = new Room(2L, "sala2", 60L, "EC");
        Room room3 = new Room(3L, "sala2", 60L, "EC");

        Timeslot timeslot = new Timeslot(1L, DayOfWeek.TUESDAY, LocalTime.NOON);
        Timeslot timeslot1 = new Timeslot(2L, DayOfWeek.TUESDAY, LocalTime.NOON.plusHours(2));
        Timeslot timeslot2 = new Timeslot(3L, DayOfWeek.TUESDAY, LocalTime.NOON.plusHours(4));

        Lesson tuesdayLesson = new Lesson(1, "subject1", LessonType.COURSE, new Teacher(1L, "Teacher1", null), studentGroup, timeslot, room2);
        Lesson thirdTuesdayLesson = new Lesson(2, "subject1", LessonType.COURSE, new Teacher(1L, "Teacher1", null), studentGroup, timeslot1, room3);
        Lesson fourthTuesdayLesson = new Lesson(3, "subject1", LessonType.COURSE, new Teacher(1L, "Teacher1", null), studentGroup, timeslot2, room);

        constraintVerifier.verifyThat(TimetableConstraintProvider::coursesInTheSameBuilding)
                .given(tuesdayLesson, thirdTuesdayLesson, fourthTuesdayLesson)
                .rewardsWith(1);

    }

    @Test
    void noGapsForHighschool() {

        StudentGroup studentGroup = new StudentGroup(1L, "Group1", 30L);

        // 1-hour timeslots on Tuesday
        Timeslot ts8am = new Timeslot(20L, DayOfWeek.TUESDAY, LocalTime.of(8, 0), LocalTime.of(9, 0));
        Timeslot ts9am = new Timeslot(21L, DayOfWeek.TUESDAY, LocalTime.of(9, 0), LocalTime.of(10, 0));
        // 1-hour gap here (10:00 - 11:00)
        Timeslot ts11am = new Timeslot(22L, DayOfWeek.TUESDAY, LocalTime.of(11, 0), LocalTime.of(12, 0));

        Room room = new Room(1L, "sala1", 60L);

        Lesson lesson1 = new Lesson(1, "Math", new Teacher(1L, "Teacher1", null), studentGroup, 1, ts8am, room);
        Lesson lesson2 = new Lesson(2, "Physics", new Teacher(2L, "Teacher2", null), studentGroup, 1, ts9am, room);
        Lesson lesson3 = new Lesson(3, "Chemistry", new Teacher(3L, "Teacher3", null), studentGroup, 1, ts11am, room);

        // Span = 8:00 to 12:00 = 240 minutes, Total instruction = 3 * 60 = 180 minutes, Gap = 60 minutes
        constraintVerifier.verifyThat(TimetableConstraintProvider::noGapsForHighschool)
                .given(lesson1, lesson2, lesson3)
                .penalizesBy(60);
    }

    @Test
    void noGapsForHighschoolNoGap() {

        StudentGroup studentGroup = new StudentGroup(1L, "Group1", 30L);

        // 1-hour timeslots on Tuesday, back-to-back
        Timeslot ts8am = new Timeslot(20L, DayOfWeek.TUESDAY, LocalTime.of(8, 0), LocalTime.of(9, 0));
        Timeslot ts9am = new Timeslot(21L, DayOfWeek.TUESDAY, LocalTime.of(9, 0), LocalTime.of(10, 0));
        Timeslot ts10am = new Timeslot(22L, DayOfWeek.TUESDAY, LocalTime.of(10, 0), LocalTime.of(11, 0));

        Room room = new Room(1L, "sala1", 60L);

        Lesson lesson1 = new Lesson(1, "Math", new Teacher(1L, "Teacher1", null), studentGroup, 1, ts8am, room);
        Lesson lesson2 = new Lesson(2, "Physics", new Teacher(2L, "Teacher2", null), studentGroup, 1, ts9am, room);
        Lesson lesson3 = new Lesson(3, "Chemistry", new Teacher(3L, "Teacher3", null), studentGroup, 1, ts10am, room);

        // No gap: span = 180 minutes, total instruction = 180 minutes
        constraintVerifier.verifyThat(TimetableConstraintProvider::noGapsForHighschool)
                .given(lesson1, lesson2, lesson3)
                .penalizesBy(0);
    }

    @Test
    void fairLessonsDistribution() {

        StudentGroup studentGroup = new StudentGroup(1L, "Group1", 30L);

        Room room = new Room(1L, "sala1", 60L);

        // 3 lessons on Monday
        Lesson mondayLesson1 = new Lesson(1, "Math", new Teacher(1L, "Teacher1", null), studentGroup, TIMESLOT1, room);
        Lesson mondayLesson2 = new Lesson(2, "Physics", new Teacher(2L, "Teacher2", null), studentGroup, TIMESLOT1, room);
        Lesson mondayLesson3 = new Lesson(3, "Chemistry", new Teacher(3L, "Teacher3", null), studentGroup, TIMESLOT1, room);

        // 1 lesson on Tuesday
        Lesson tuesdayLesson1 = new Lesson(4, "History", new Teacher(4L, "Teacher4", null), studentGroup, TIMESLOT2, room);

        // Monday: count=3, penalty=9. Tuesday: count=1, penalty=1. Total: 10.
        constraintVerifier.verifyThat(TimetableConstraintProvider::fairLessonsDistribution)
                .given(mondayLesson1, mondayLesson2, mondayLesson3, tuesdayLesson1)
                .penalizesBy(10);
    }

    @Test
    void earlyStartForHighschool() {
        StudentGroup studentGroup = new StudentGroup(1L, "Group1", 30L);
        Room room = new Room(1L, "sala1", 60L);

        // First lesson starts at 10:00 (120 minutes after 8:00)
        Timeslot ts10am = new Timeslot(20L, DayOfWeek.MONDAY, LocalTime.of(10, 0), LocalTime.of(11, 0));
        Timeslot ts11am = new Timeslot(21L, DayOfWeek.MONDAY, LocalTime.of(11, 0), LocalTime.of(12, 0));

        Lesson lesson1 = new Lesson(1, "Math", new Teacher(1L, "Teacher1", null), studentGroup, 1, ts10am, room);
        Lesson lesson2 = new Lesson(2, "Physics", new Teacher(2L, "Teacher2", null), studentGroup, 1, ts11am, room);

        constraintVerifier.verifyThat(TimetableConstraintProvider::earlyStartForHighschool)
                .given(lesson1, lesson2)
                .penalizesBy(120); // 120 minutes penalty
    }

    @Test
    void earlyStartForHighschoolNoPenalty() {
        StudentGroup studentGroup = new StudentGroup(1L, "Group1", 30L);
        Room room = new Room(1L, "sala1", 60L);

        // First lesson starts exactly at 8:00
        Timeslot ts8am = new Timeslot(20L, DayOfWeek.MONDAY, LocalTime.of(8, 0), LocalTime.of(9, 0));
        Timeslot ts9am = new Timeslot(21L, DayOfWeek.MONDAY, LocalTime.of(9, 0), LocalTime.of(10, 0));

        Lesson lesson1 = new Lesson(1, "Math", new Teacher(1L, "Teacher1", null), studentGroup, 1, ts8am, room);
        Lesson lesson2 = new Lesson(2, "Physics", new Teacher(2L, "Teacher2", null), studentGroup, 1, ts9am, room);

        constraintVerifier.verifyThat(TimetableConstraintProvider::earlyStartForHighschool)
                .given(lesson1, lesson2)
                .penalizesBy(0); // 0 penalty
    }

    @Test
    void foreignLanguageSameTimeslot_differentTimeslots_penalizes() {
        // 5A and 5B are same year (FIRST), both foreign language, DIFFERENT timeslots → penalty
        StudentGroup group5A = new StudentGroup(10L, Year.FIRST, "5A", "5", 30L);
        StudentGroup group5B = new StudentGroup(11L, Year.FIRST, "5B", "5", 30L);

        Timeslot tsWed8 = new Timeslot(30L, DayOfWeek.WEDNESDAY, LocalTime.of(8, 0), LocalTime.of(9, 0));
        Timeslot tsThu8 = new Timeslot(31L, DayOfWeek.THURSDAY, LocalTime.of(8, 0), LocalTime.of(9, 0));

        Room foreignRoom = new Room(10L, "Foreign_Language_Room", 60L);
        Room room5B = new Room(11L, "Room_5B", 30L);

        Teacher teacher1 = new Teacher(10L, "Teacher 1", null);
        Teacher teacher2 = new Teacher(11L, "Teacher 2", null);

        // 5A foreign language at Wednesday 08:00, 5B foreign language at Thursday 08:00
        Lesson lesson5A = new Lesson(100L, "Lb. ger/fr", teacher1, group5A, 1, tsWed8, foreignRoom);
        Lesson lesson5B = new Lesson(101L, "Lb. ger/fr", teacher2, group5B, 1, tsThu8, room5B);

        constraintVerifier.verifyThat(TimetableConstraintProvider::foreignLanguageSameTimeslot)
                .given(lesson5A, lesson5B)
                .penalizesBy(1);
    }

    @Test
    void foreignLanguageSameTimeslot_sameTimeslot_noPenalty() {
        // 5A and 5B are same year, both foreign language, SAME timeslot → no penalty
        StudentGroup group5A = new StudentGroup(10L, Year.FIRST, "5A", "5", 30L);
        StudentGroup group5B = new StudentGroup(11L, Year.FIRST, "5B", "5", 30L);

        Timeslot tsWed8 = new Timeslot(30L, DayOfWeek.WEDNESDAY, LocalTime.of(8, 0), LocalTime.of(9, 0));

        Room foreignRoom = new Room(10L, "Foreign_Language_Room", 60L);
        Room room5B = new Room(11L, "Room_5B", 30L);

        Teacher teacher1 = new Teacher(10L, "Teacher 1", null);
        Teacher teacher2 = new Teacher(11L, "Teacher 2", null);

        // Both in same timeslot
        Lesson lesson5A = new Lesson(100L, "Lb. ger/fr", teacher1, group5A, 1, tsWed8, foreignRoom);
        Lesson lesson5B = new Lesson(101L, "Lb. fr", teacher2, group5B, 1, tsWed8, room5B);

        constraintVerifier.verifyThat(TimetableConstraintProvider::foreignLanguageSameTimeslot)
                .given(lesson5A, lesson5B)
                .penalizesBy(0);
    }

    @Test
    void foreignLanguageSameTimeslot_differentYears_noPenalty() {
        // 5A (FIRST) and 6A (SECOND) are different years → no penalty even if different timeslots
        StudentGroup group5A = new StudentGroup(10L, Year.FIRST, "5A", "5", 30L);
        StudentGroup group6A = new StudentGroup(12L, Year.SECOND, "6A", "6", 30L);

        Timeslot tsWed8 = new Timeslot(30L, DayOfWeek.WEDNESDAY, LocalTime.of(8, 0), LocalTime.of(9, 0));
        Timeslot tsThu8 = new Timeslot(31L, DayOfWeek.THURSDAY, LocalTime.of(8, 0), LocalTime.of(9, 0));

        Room foreignRoom = new Room(10L, "Foreign_Language_Room", 60L);

        Teacher teacher1 = new Teacher(10L, "Teacher 1", null);
        Teacher teacher2 = new Teacher(11L, "Teacher 3", null);

        Lesson lesson5A = new Lesson(100L, "Lb. ger/fr", teacher1, group5A, 1, tsWed8, foreignRoom);
        Lesson lesson6A = new Lesson(101L, "Lb. fr", teacher2, group6A, 1, tsThu8, foreignRoom);

        constraintVerifier.verifyThat(TimetableConstraintProvider::foreignLanguageSameTimeslot)
                .given(lesson5A, lesson6A)
                .penalizesBy(0);
    }

    @Test
    void foreignLanguageSameTimeslot_nonForeignSubject_noPenalty() {
        // Both "Math" (not foreign language) → no penalty
        StudentGroup group5A = new StudentGroup(10L, Year.FIRST, "5A", "5", 30L);
        StudentGroup group5B = new StudentGroup(11L, Year.FIRST, "5B", "5", 30L);

        Timeslot tsWed8 = new Timeslot(30L, DayOfWeek.WEDNESDAY, LocalTime.of(8, 0), LocalTime.of(9, 0));
        Timeslot tsThu8 = new Timeslot(31L, DayOfWeek.THURSDAY, LocalTime.of(8, 0), LocalTime.of(9, 0));

        Room room = new Room(10L, "Room1", 60L);

        Teacher teacher1 = new Teacher(10L, "Teacher1", null);
        Teacher teacher2 = new Teacher(11L, "Teacher2", null);

        Lesson lesson5A = new Lesson(100L, "Math", teacher1, group5A, 1, tsWed8, room);
        Lesson lesson5B = new Lesson(101L, "Math", teacher2, group5B, 1, tsThu8, room);

        constraintVerifier.verifyThat(TimetableConstraintProvider::foreignLanguageSameTimeslot)
                .given(lesson5A, lesson5B)
                .penalizesBy(0);
    }

    @Test
    void foreignLanguageSameTimeslot_threeGroups_penalizesCorrectly() {
        // 5A, 5B, 5C all same year. 5A+5B share timeslot, 5C different → 2 penalized pairs
        StudentGroup group5A = new StudentGroup(10L, Year.FIRST, "5A", "5", 30L);
        StudentGroup group5B = new StudentGroup(11L, Year.FIRST, "5B", "5", 30L);
        StudentGroup group5C = new StudentGroup(12L, Year.FIRST, "5C", "5", 30L);

        Timeslot tsWed8 = new Timeslot(30L, DayOfWeek.WEDNESDAY, LocalTime.of(8, 0), LocalTime.of(9, 0));
        Timeslot tsThu8 = new Timeslot(31L, DayOfWeek.THURSDAY, LocalTime.of(8, 0), LocalTime.of(9, 0));

        Room foreignRoom = new Room(10L, "Foreign_Language_Room", 60L);
        Room room5B = new Room(11L, "Room_5B", 30L);
        Room room5C = new Room(12L, "Room_5C", 30L);

        Teacher teacher1 = new Teacher(10L, "Teacher 1", null);
        Teacher teacher2 = new Teacher(11L, "Teacher 2", null);
        Teacher teacher3 = new Teacher(12L, "Teacher 3", null);

        // 5A and 5B in same timeslot (Wed), 5C in different timeslot (Thu)
        Lesson lesson5A = new Lesson(100L, "Lb. ger/fr", teacher1, group5A, 1, tsWed8, foreignRoom);
        Lesson lesson5B = new Lesson(101L, "Lb. ger/fr", teacher2, group5B, 1, tsWed8, room5B);
        Lesson lesson5C = new Lesson(102L, "Lb. ger/fr", teacher3, group5C, 1, tsThu8, room5C);

        // Pairs: (5A,5B)=same TS→no penalty, (5A,5C)=diff TS→penalty, (5B,5C)=diff TS→penalty
        constraintVerifier.verifyThat(TimetableConstraintProvider::foreignLanguageSameTimeslot)
                .given(lesson5A, lesson5B, lesson5C)
                .penalizesBy(2);
    }

    @Test
    void schoolRoomConflict_exemptsSameYearForeignLanguage() {
        // Two same-year foreign language lessons in same timeslot + same room → NO penalty (exempted)
        StudentGroup group5A = new StudentGroup(10L, Year.FIRST, "5A", "5", 30L);
        StudentGroup group5B = new StudentGroup(11L, Year.FIRST, "5B", "5", 30L);

        Timeslot tsWed8 = new Timeslot(30L, DayOfWeek.WEDNESDAY, LocalTime.of(8, 0), LocalTime.of(9, 0));

        Room foreignRoom = new Room(10L, "Foreign_Language_Room", 60L);

        Teacher teacher1 = new Teacher(10L, "Teacher 1", null);
        Teacher teacher2 = new Teacher(11L, "Teacher 2", null);

        Lesson lesson5A = new Lesson(100L, "Lb. ger/fr", teacher1, group5A, 1, tsWed8, foreignRoom);
        Lesson lesson5B = new Lesson(101L, "Lb. fr", teacher2, group5B, 1, tsWed8, foreignRoom);

        constraintVerifier.verifyThat(TimetableConstraintProvider::schoolRoomConflict)
                .given(lesson5A, lesson5B)
                .penalizesBy(0);
    }

    @Test
    void schoolRoomConflict_penalizesNonForeignLanguage() {
        // Two non-foreign-language lessons in same timeslot + same room → penalty (not exempted)
        StudentGroup group5A = new StudentGroup(10L, Year.FIRST, "5A", "5", 30L);
        StudentGroup group5B = new StudentGroup(11L, Year.FIRST, "5B", "5", 30L);

        Timeslot tsWed8 = new Timeslot(30L, DayOfWeek.WEDNESDAY, LocalTime.of(8, 0), LocalTime.of(9, 0));

        Room room = new Room(10L, "Room1", 60L);

        Teacher teacher1 = new Teacher(10L, "Teacher1", null);
        Teacher teacher2 = new Teacher(11L, "Teacher2", null);

        Lesson lesson1 = new Lesson(100L, "Math", teacher1, group5A, 1, tsWed8, room);
        Lesson lesson2 = new Lesson(101L, "Physics", teacher2, group5B, 1, tsWed8, room);

        constraintVerifier.verifyThat(TimetableConstraintProvider::schoolRoomConflict)
                .given(lesson1, lesson2)
                .penalizesBy(1);
    }

    @Test
    void schoolTeacherConflict_exemptsSameYearForeignLanguage() {
        // Same teacher, same timeslot, both foreign language + same year → NO penalty (exempted)
        StudentGroup group5A = new StudentGroup(10L, Year.FIRST, "5A", "5", 30L);
        StudentGroup group5B = new StudentGroup(11L, Year.FIRST, "5B", "5", 30L);

        Timeslot tsWed8 = new Timeslot(30L, DayOfWeek.WEDNESDAY, LocalTime.of(8, 0), LocalTime.of(9, 0));

        Room foreignRoom = new Room(10L, "Foreign_Language_Room", 60L);
        Room room5B = new Room(11L, "Room_5B", 30L);

        Teacher sharedTeacher = new Teacher(10L, "Teacher 1", null);

        Lesson lesson5A = new Lesson(100L, "Lb. ger/fr", sharedTeacher, group5A, 1, tsWed8, foreignRoom);
        Lesson lesson5B = new Lesson(101L, "Lb. ger", sharedTeacher, group5B, 1, tsWed8, room5B);

        constraintVerifier.verifyThat(TimetableConstraintProvider::schoolTeacherConflict)
                .given(lesson5A, lesson5B)
                .penalizesBy(0);
    }

    @Test
    void schoolTeacherConflict_penalizesNonForeignLanguage() {
        // Same teacher, same timeslot, non-foreign subjects → penalty (not exempted)
        StudentGroup group5A = new StudentGroup(10L, Year.FIRST, "5A", "5", 30L);
        StudentGroup group5B = new StudentGroup(11L, Year.FIRST, "5B", "5", 30L);

        Timeslot tsWed8 = new Timeslot(30L, DayOfWeek.WEDNESDAY, LocalTime.of(8, 0), LocalTime.of(9, 0));

        Room room1 = new Room(10L, "Room1", 60L);
        Room room2 = new Room(11L, "Room2", 60L);

        Teacher sharedTeacher = new Teacher(10L, "Teacher1", null);

        Lesson lesson1 = new Lesson(100L, "Math", sharedTeacher, group5A, 1, tsWed8, room1);
        Lesson lesson2 = new Lesson(101L, "Math", sharedTeacher, group5B, 1, tsWed8, room2);

        constraintVerifier.verifyThat(TimetableConstraintProvider::schoolTeacherConflict)
                .given(lesson1, lesson2)
                .penalizesBy(1);
    }

}
