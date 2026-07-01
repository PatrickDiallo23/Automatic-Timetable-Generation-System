package com.patrick.timetableappbackend.solver;

import ai.timefold.solver.core.api.domain.solution.ConstraintWeightOverrides;
import ai.timefold.solver.core.api.score.HardMediumSoftScore;
import com.patrick.timetableappbackend.model.ConstraintModel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TimetableConstraintConfiguration {

    //hard
    private HardMediumSoftScore roomConflict = HardMediumSoftScore.ZERO;
    private HardMediumSoftScore teacherConflict = HardMediumSoftScore.ZERO;
    private HardMediumSoftScore studentGroupConflict = HardMediumSoftScore.ZERO;
    private HardMediumSoftScore studentGroupConflictWithGroupBy = HardMediumSoftScore.ZERO;
    private HardMediumSoftScore capacityRoomConflict = HardMediumSoftScore.ZERO;
    private HardMediumSoftScore courseStudentsGroupedInTheSameRoom = HardMediumSoftScore.ZERO;
    private HardMediumSoftScore seminarStudentsGroupedInTheSameRoom = HardMediumSoftScore.ZERO;
    private HardMediumSoftScore labsStudentsGroupedInTheSameRoom = HardMediumSoftScore.ZERO;
    private HardMediumSoftScore roomConflictUniversity = HardMediumSoftScore.ZERO;
    private HardMediumSoftScore teacherConflictUniversity = HardMediumSoftScore.ZERO;
    private HardMediumSoftScore overlappingTimeslot = HardMediumSoftScore.ZERO;

    //medium
    private HardMediumSoftScore maximumCoursesForStudents = HardMediumSoftScore.ZERO;
    private HardMediumSoftScore coursesGroupedInTheSameTimeslot = HardMediumSoftScore.ZERO;
    private HardMediumSoftScore seminarsGroupedInTheSameTimeslot = HardMediumSoftScore.ZERO;
    private HardMediumSoftScore maximmumCoursesTeached = HardMediumSoftScore.ZERO;
    private HardMediumSoftScore maximizePreferredTimeslotAssignments = HardMediumSoftScore.ZERO;

    //soft
    private HardMediumSoftScore teacherRoomStability = HardMediumSoftScore.ZERO;
    private HardMediumSoftScore teacherTimeEfficiency = HardMediumSoftScore.ZERO;
    private HardMediumSoftScore studentGroupVariety = HardMediumSoftScore.ZERO;
    private HardMediumSoftScore gapsLongerThan4Hours = HardMediumSoftScore.ZERO;
    private HardMediumSoftScore labsGroupedInTheSameTimeslot = HardMediumSoftScore.ZERO;
    private HardMediumSoftScore coursesInTheSameBuilding = HardMediumSoftScore.ZERO;
    private HardMediumSoftScore noGapsForHighschool = HardMediumSoftScore.ZERO;
    private HardMediumSoftScore fairLessonsDistribution = HardMediumSoftScore.ZERO;
    private HardMediumSoftScore earlyStartForHighschool = HardMediumSoftScore.ZERO;

    // Foreign language grouping constraints
    private HardMediumSoftScore foreignLanguageSameTimeslot = HardMediumSoftScore.ZERO;
    private HardMediumSoftScore schoolRoomConflict = HardMediumSoftScore.ZERO;
    private HardMediumSoftScore schoolTeacherConflict = HardMediumSoftScore.ZERO;

    public TimetableConstraintConfiguration(List<ConstraintModel> constraintList) {
        constraintList.forEach((constraint) -> {
            switch (constraint.getDescription()) {
                //hard
                case "roomConflict" -> roomConflict = mapStringToHardMediumSoftScore(constraint.getWeight());
                case "teacherConflict" -> teacherConflict = mapStringToHardMediumSoftScore(constraint.getWeight());
                case "studentGroupConflict" -> studentGroupConflict = mapStringToHardMediumSoftScore(constraint.getWeight());
                case "studentGroupConflictAdvanced" -> studentGroupConflictWithGroupBy = mapStringToHardMediumSoftScore(constraint.getWeight());
                case "capacityRoomConflict" -> capacityRoomConflict = mapStringToHardMediumSoftScore(constraint.getWeight());
                case "courseStudentsGroupedInTheSameRoom" -> courseStudentsGroupedInTheSameRoom = mapStringToHardMediumSoftScore(constraint.getWeight());
                case "seminarStudentsGroupedInTheSameRoom" -> seminarStudentsGroupedInTheSameRoom = mapStringToHardMediumSoftScore(constraint.getWeight());
                case "labsStudentsGroupedInTheSameRoom" -> labsStudentsGroupedInTheSameRoom = mapStringToHardMediumSoftScore(constraint.getWeight());
                case "roomConflictUniversity" -> roomConflictUniversity = mapStringToHardMediumSoftScore(constraint.getWeight());
                case "teacherConflictUniversity" -> teacherConflictUniversity = mapStringToHardMediumSoftScore(constraint.getWeight());
                case "overlappingTimeslot" -> overlappingTimeslot = mapStringToHardMediumSoftScore(constraint.getWeight());

                //medium
                case "maximumCoursesForStudents" -> maximumCoursesForStudents = mapStringToHardMediumSoftScore(constraint.getWeight());
                case "maximmumCoursesTeached" -> maximmumCoursesTeached = mapStringToHardMediumSoftScore(constraint.getWeight());
                case "maximizePreferredTimeslotAssignments" -> maximizePreferredTimeslotAssignments = mapStringToHardMediumSoftScore(constraint.getWeight());
                case "coursesGroupedInTheSameTimeslot" -> coursesGroupedInTheSameTimeslot = mapStringToHardMediumSoftScore(constraint.getWeight());
                case "seminarsGroupedInTheSameTimeslot" -> seminarsGroupedInTheSameTimeslot = mapStringToHardMediumSoftScore(constraint.getWeight());

                //soft
                case "teacherRoomStability" -> teacherRoomStability = mapStringToHardMediumSoftScore(constraint.getWeight());
                case "teacherTimeEfficiency" -> teacherTimeEfficiency = mapStringToHardMediumSoftScore(constraint.getWeight());
                case "studentGroupVariety" -> studentGroupVariety = mapStringToHardMediumSoftScore(constraint.getWeight());
                case "gapsLongerThan4Hours" -> gapsLongerThan4Hours = mapStringToHardMediumSoftScore(constraint.getWeight());
                case "labsGroupedInTheSameTimeslot" -> labsGroupedInTheSameTimeslot = mapStringToHardMediumSoftScore(constraint.getWeight());
                case "coursesInTheSameBuilding" -> coursesInTheSameBuilding = mapStringToHardMediumSoftScore(constraint.getWeight());
                case "noGapsForHighschool" -> noGapsForHighschool = mapStringToHardMediumSoftScore(constraint.getWeight());
                case "fairLessonsDistribution" -> fairLessonsDistribution = mapStringToHardMediumSoftScore(constraint.getWeight());
                case "earlyStartForHighschool" -> earlyStartForHighschool = mapStringToHardMediumSoftScore(constraint.getWeight());
                case "foreignLanguageSameTimeslot" -> foreignLanguageSameTimeslot = mapStringToHardMediumSoftScore(constraint.getWeight());
                case "schoolRoomConflict" -> schoolRoomConflict = mapStringToHardMediumSoftScore(constraint.getWeight());
                case "schoolTeacherConflict" -> schoolTeacherConflict = mapStringToHardMediumSoftScore(constraint.getWeight());
            }
        });
    }

    public ConstraintWeightOverrides<HardMediumSoftScore> toOverrides() {
        Map<String, HardMediumSoftScore> map = new HashMap<>();
        map.put("roomConflict", roomConflict);
        map.put("teacherConflict", teacherConflict);
        map.put("studentGroupConflict", studentGroupConflict);
        map.put("studentGroupConflictAdvanced", studentGroupConflictWithGroupBy);
        map.put("capacityRoomConflict", capacityRoomConflict);
        map.put("courseStudentsGroupedInTheSameRoom", courseStudentsGroupedInTheSameRoom);
        map.put("seminarStudentsGroupedInTheSameRoom", seminarStudentsGroupedInTheSameRoom);
        map.put("labsStudentsGroupedInTheSameRoom", labsStudentsGroupedInTheSameRoom);
        map.put("roomConflictUniversity", roomConflictUniversity);
        map.put("teacherConflictUniversity", teacherConflictUniversity);
        map.put("overlappingTimeslot", overlappingTimeslot);
        map.put("maximumCoursesForStudents", maximumCoursesForStudents);
        map.put("coursesGroupedInTheSameTimeslot", coursesGroupedInTheSameTimeslot);
        map.put("seminarsGroupedInTheSameTimeslot", seminarsGroupedInTheSameTimeslot);
        map.put("maximmumCoursesTeached", maximmumCoursesTeached);
        map.put("maximizePreferredTimeslotAssignments", maximizePreferredTimeslotAssignments);
        map.put("teacherRoomStability", teacherRoomStability);
        map.put("teacherTimeEfficiency", teacherTimeEfficiency);
        map.put("studentGroupVariety", studentGroupVariety);
        map.put("gapsLongerThan4Hours", gapsLongerThan4Hours);
        map.put("labsGroupedInTheSameTimeslot", labsGroupedInTheSameTimeslot);
        map.put("coursesInTheSameBuilding", coursesInTheSameBuilding);
        map.put("noGapsForHighschool", noGapsForHighschool);
        map.put("fairLessonsDistribution", fairLessonsDistribution);
        map.put("earlyStartForHighschool", earlyStartForHighschool);
        map.put("foreignLanguageSameTimeslot", foreignLanguageSameTimeslot);
        map.put("schoolRoomConflict", schoolRoomConflict);
        map.put("schoolTeacherConflict", schoolTeacherConflict);
        return ConstraintWeightOverrides.of(map);
    }

    private HardMediumSoftScore mapStringToHardMediumSoftScore(String weight) {
        return switch (weight) {
            case "HARD" -> HardMediumSoftScore.ONE_HARD;
            case "MEDIUM" -> HardMediumSoftScore.ONE_MEDIUM;
            case "SOFT" -> HardMediumSoftScore.ONE_SOFT;
            default -> HardMediumSoftScore.ZERO;
        };
    }
}
