package com.patrick.timetableappbackend.utils;

import com.patrick.timetableappbackend.model.RestrictionRule;
import com.patrick.timetableappbackend.model.Room;
import com.patrick.timetableappbackend.model.RuleCombination;
import com.patrick.timetableappbackend.model.RuleTargetType;
import com.patrick.timetableappbackend.model.Timeslot;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

public final class RuleEvaluator {

    private RuleEvaluator() {
    }

    public static List<Room> filterRooms(List<Room> allRooms, Set<RestrictionRule> rules, RuleCombination combination) {
        List<RestrictionRule> roomRules = rules.stream()
                .filter(r -> r.getTargetType() == RuleTargetType.ROOM)
                .toList();

        if (roomRules.isEmpty()) {
            return allRooms;
        }

        return allRooms.stream()
                .filter(room -> matchesCombination(room, roomRules, combination))
                .collect(Collectors.toList());
    }

    public static List<Timeslot> filterTimeslots(List<Timeslot> allTimeslots, Set<RestrictionRule> rules, RuleCombination combination) {
        List<RestrictionRule> timeslotRules = rules.stream()
                .filter(r -> r.getTargetType() == RuleTargetType.TIMESLOT)
                .toList();

        if (timeslotRules.isEmpty()) {
            return allTimeslots;
        }

        return allTimeslots.stream()
                .filter(ts -> matchesCombination(ts, timeslotRules, combination))
                .collect(Collectors.toList());
    }

    private static boolean matchesCombination(Room room, List<RestrictionRule> rules, RuleCombination combination) {
        if (combination == RuleCombination.AND) {
            return rules.stream().allMatch(rule -> matchesRoom(room, rule));
        }
        return rules.stream().anyMatch(rule -> matchesRoom(room, rule));
    }

    private static boolean matchesCombination(Timeslot timeslot, List<RestrictionRule> rules, RuleCombination combination) {
        if (combination == RuleCombination.AND) {
            return rules.stream().allMatch(rule -> matchesTimeslot(timeslot, rule));
        }
        return rules.stream().anyMatch(rule -> matchesTimeslot(timeslot, rule));
    }

    private static boolean matchesRoom(Room room, RestrictionRule rule) {
        if (rule.isSpecificItemsMode()) {
            return rule.getSpecificRooms().stream().anyMatch(r -> r.getId().equals(room.getId()));
        }
        String fieldValue = getRoomFieldValue(room, rule.getCriteriaField());
        return evaluateOperator(fieldValue, rule.getOperator(), rule.getCriteriaValue());
    }

    private static boolean matchesTimeslot(Timeslot timeslot, RestrictionRule rule) {
        if (rule.isSpecificItemsMode()) {
            return rule.getSpecificTimeslots().stream().anyMatch(ts -> ts.getId().equals(timeslot.getId()));
        }
        String fieldValue = getTimeslotFieldValue(timeslot, rule.getCriteriaField());
        return evaluateOperator(fieldValue, rule.getOperator(), rule.getCriteriaValue());
    }

    private static String getRoomFieldValue(Room room, String field) {
        return switch (field.toLowerCase()) {
            case "name" -> room.getName();
            case "building" -> room.getBuilding();
            case "capacity" -> room.getCapacity() != null ? room.getCapacity().toString() : null;
            default -> null;
        };
    }

    private static String getTimeslotFieldValue(Timeslot timeslot, String field) {
        return switch (field.toLowerCase()) {
            case "dayofweek" -> timeslot.getDayOfWeek() != null ? timeslot.getDayOfWeek().name() : null;
            case "starttime" -> timeslot.getStartTime() != null ? timeslot.getStartTime().toString() : null;
            case "endtime" -> timeslot.getEndTime() != null ? timeslot.getEndTime().toString() : null;
            default -> null;
        };
    }

    private static boolean evaluateOperator(String fieldValue, com.patrick.timetableappbackend.model.RuleOperator operator, String criteriaValue) {
        if (fieldValue == null) {
            return false;
        }

        return switch (operator) {
            case EQUALS -> fieldValue.equalsIgnoreCase(criteriaValue);
            case NOT_EQUALS -> !fieldValue.equalsIgnoreCase(criteriaValue);
            case IN -> {
                Set<String> values = Arrays.stream(criteriaValue.split(","))
                        .map(String::trim)
                        .map(String::toUpperCase)
                        .collect(Collectors.toSet());
                yield values.contains(fieldValue.toUpperCase());
            }
            case NOT_IN -> {
                Set<String> values = Arrays.stream(criteriaValue.split(","))
                        .map(String::trim)
                        .map(String::toUpperCase)
                        .collect(Collectors.toSet());
                yield !values.contains(fieldValue.toUpperCase());
            }
            case GREATER_THAN_OR_EQUAL -> compareValues(fieldValue, criteriaValue) >= 0;
            case LESS_THAN -> compareValues(fieldValue, criteriaValue) < 0;
            case CONTAINS -> fieldValue.toUpperCase().contains(criteriaValue.toUpperCase());
        };
    }

    private static int compareValues(String fieldValue, String criteriaValue) {
        try {
            double fieldNum = Double.parseDouble(fieldValue);
            double criteriaNum = Double.parseDouble(criteriaValue);
            return Double.compare(fieldNum, criteriaNum);
        } catch (NumberFormatException e) {
            // Try time comparison
            try {
                LocalTime fieldTime = LocalTime.parse(fieldValue);
                LocalTime criteriaTime = LocalTime.parse(criteriaValue);
                return fieldTime.compareTo(criteriaTime);
            } catch (Exception e2) {
                // Try day-of-week comparison
                try {
                    DayOfWeek fieldDay = DayOfWeek.valueOf(fieldValue.toUpperCase());
                    DayOfWeek criteriaDay = DayOfWeek.valueOf(criteriaValue.toUpperCase());
                    return fieldDay.compareTo(criteriaDay);
                } catch (Exception e3) {
                    return fieldValue.compareToIgnoreCase(criteriaValue);
                }
            }
        }
    }
}
