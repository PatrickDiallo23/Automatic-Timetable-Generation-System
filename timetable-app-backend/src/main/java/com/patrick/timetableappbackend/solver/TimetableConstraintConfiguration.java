package com.patrick.timetableappbackend.solver;

import ai.timefold.solver.core.api.domain.constraintweight.ConstraintConfiguration;
import ai.timefold.solver.core.api.domain.constraintweight.ConstraintWeight;
import ai.timefold.solver.core.api.score.buildin.hardmediumsoft.HardMediumSoftScore;
import com.patrick.timetableappbackend.model.ConstraintModel;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@ConstraintConfiguration(constraintPackage = "com.patrick.timetableappbackend.solver")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TimetableConstraintConfiguration {

  // todo to implement a benchmark if possible
  // hard
  @ConstraintWeight("roomConflict")
  private HardMediumSoftScore roomConflict = HardMediumSoftScore.ZERO;

  @ConstraintWeight("teacherConflict")
  private HardMediumSoftScore teacherConflict = HardMediumSoftScore.ZERO;

  @ConstraintWeight("studentGroupConflict")
  private HardMediumSoftScore studentGroupConflict = HardMediumSoftScore.ZERO;

  @ConstraintWeight("capacityRoomConflict")
  private HardMediumSoftScore capacityRoomConflict = HardMediumSoftScore.ZERO;

  @ConstraintWeight("courseStudentsGroupedInTheSameRoom")
  private HardMediumSoftScore courseStudentsGroupedInTheSameRoom = HardMediumSoftScore.ZERO;

  @ConstraintWeight("seminarStudentsGroupedInTheSameRoom")
  private HardMediumSoftScore seminarStudentsGroupedInTheSameRoom = HardMediumSoftScore.ZERO;

  @ConstraintWeight("labsStudentsGroupedInTheSameRoom")
  private HardMediumSoftScore labsStudentsGroupedInTheSameRoom = HardMediumSoftScore.ZERO;

  @ConstraintWeight("roomConflictUniversity")
  private HardMediumSoftScore roomConflictUniversity = HardMediumSoftScore.ZERO;

  @ConstraintWeight("teacherConflictUniversity")
  private HardMediumSoftScore teacherConflictUniversity = HardMediumSoftScore.ZERO;

  @ConstraintWeight("overlappingTimeslot")
  private HardMediumSoftScore overlappingTimeslot = HardMediumSoftScore.ZERO;

  @ConstraintWeight("sportLessonInSportRoom")
  private HardMediumSoftScore sportLessonInSportRoom = HardMediumSoftScore.ZERO;

  @ConstraintWeight("lessonDurationConflict")
  private HardMediumSoftScore lessonDurationConflict = HardMediumSoftScore.ZERO;

  // medium

  @ConstraintWeight("maximumCoursesForStudents")
  private HardMediumSoftScore maximumCoursesForStudents = HardMediumSoftScore.ZERO;

  @ConstraintWeight("coursesGroupedInTheSameTimeslot")
  private HardMediumSoftScore coursesGroupedInTheSameTimeslot = HardMediumSoftScore.ZERO;

  @ConstraintWeight("seminarsGroupedInTheSameTimeslot")
  private HardMediumSoftScore seminarsGroupedInTheSameTimeslot = HardMediumSoftScore.ZERO;

  @ConstraintWeight("maximmumCoursesTeached")
  private HardMediumSoftScore maximmumCoursesTeached = HardMediumSoftScore.ZERO;

  @ConstraintWeight("maximizePreferredTimeslotAssignments")
  private HardMediumSoftScore maximizePreferredTimeslotAssignments = HardMediumSoftScore.ZERO;

  // soft
  @ConstraintWeight("teacherRoomStability")
  private HardMediumSoftScore teacherRoomStability = HardMediumSoftScore.ZERO;

  @ConstraintWeight("teacherTimeEfficiency")
  private HardMediumSoftScore teacherTimeEfficiency = HardMediumSoftScore.ZERO;

  @ConstraintWeight("studentGroupVariety")
  private HardMediumSoftScore studentGroupVariety = HardMediumSoftScore.ZERO;

  @ConstraintWeight("gapsLongerThan4Hours")
  private HardMediumSoftScore gapsLongerThan4Hours = HardMediumSoftScore.ZERO;

  @ConstraintWeight("labsGroupedInTheSameTimeslot")
  private HardMediumSoftScore labsGroupedInTheSameTimeslot = HardMediumSoftScore.ZERO;

  @ConstraintWeight("coursesInTheSameBuilding")
  private HardMediumSoftScore coursesInTheSameBuilding = HardMediumSoftScore.ZERO;

  @ConstraintWeight("labAfterSeminar")
  private HardMediumSoftScore labAfterSeminar = HardMediumSoftScore.ZERO;

  public TimetableConstraintConfiguration(List<ConstraintModel> constraintList) {
    constraintList.forEach(
        (constraint) -> {
          switch (constraint.getDescription()) {
            // hard
            case "roomConflict" ->
                roomConflict = mapStringToHardMediumSoftScore(constraint.getWeight());
            case "teacherConflict" ->
                teacherConflict = mapStringToHardMediumSoftScore(constraint.getWeight());
            case "studentGroupConflict" ->
                studentGroupConflict = mapStringToHardMediumSoftScore(constraint.getWeight());
            case "capacityRoomConflict" ->
                capacityRoomConflict = mapStringToHardMediumSoftScore(constraint.getWeight());
            case "courseStudentsGroupedInTheSameRoom" ->
                courseStudentsGroupedInTheSameRoom =
                    mapStringToHardMediumSoftScore(constraint.getWeight());
            case "seminarStudentsGroupedInTheSameRoom" ->
                seminarStudentsGroupedInTheSameRoom =
                    mapStringToHardMediumSoftScore(constraint.getWeight());
            case "labsStudentsGroupedInTheSameRoom" ->
                labsStudentsGroupedInTheSameRoom =
                    mapStringToHardMediumSoftScore(constraint.getWeight());
            case "roomConflictUniversity" ->
                roomConflictUniversity = mapStringToHardMediumSoftScore(constraint.getWeight());
            case "teacherConflictUniversity" ->
                teacherConflictUniversity = mapStringToHardMediumSoftScore(constraint.getWeight());
            case "overlappingTimeslot" ->
                overlappingTimeslot = mapStringToHardMediumSoftScore(constraint.getWeight());
            case "sportLessonInSportRoom" ->
                sportLessonInSportRoom = mapStringToHardMediumSoftScore(constraint.getWeight());
            case "lessonDurationConflict" ->
                lessonDurationConflict = mapStringToHardMediumSoftScore(constraint.getWeight());

            // medium
            case "maximumCoursesForStudents" ->
                maximumCoursesForStudents = mapStringToHardMediumSoftScore(constraint.getWeight());
            case "maximmumCoursesTeached" ->
                maximmumCoursesTeached = mapStringToHardMediumSoftScore(constraint.getWeight());
            case "maximizePreferredTimeslotAssignments" ->
                maximizePreferredTimeslotAssignments =
                    mapStringToHardMediumSoftScore(constraint.getWeight());
            case "coursesGroupedInTheSameTimeslot" ->
                coursesGroupedInTheSameTimeslot =
                    mapStringToHardMediumSoftScore(constraint.getWeight());
            case "seminarsGroupedInTheSameTimeslot" ->
                seminarsGroupedInTheSameTimeslot =
                    mapStringToHardMediumSoftScore(constraint.getWeight());

            // soft
            case "teacherRoomStability" ->
                teacherRoomStability = mapStringToHardMediumSoftScore(constraint.getWeight());
            case "teacherTimeEfficiency" ->
                teacherTimeEfficiency = mapStringToHardMediumSoftScore(constraint.getWeight());
            case "studentGroupVariety" ->
                studentGroupVariety = mapStringToHardMediumSoftScore(constraint.getWeight());
            case "gapsLongerThan4Hours" ->
                gapsLongerThan4Hours = mapStringToHardMediumSoftScore(constraint.getWeight());
            case "labsGroupedInTheSameTimeslot" ->
                labsGroupedInTheSameTimeslot =
                    mapStringToHardMediumSoftScore(constraint.getWeight());
            case "coursesInTheSameBuilding" ->
                coursesInTheSameBuilding = mapStringToHardMediumSoftScore(constraint.getWeight());
            case "labAfterSeminar" ->
                labAfterSeminar = mapStringToHardMediumSoftScore(constraint.getWeight());
              // Add more cases for other constraints if needed
          }
        });
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
