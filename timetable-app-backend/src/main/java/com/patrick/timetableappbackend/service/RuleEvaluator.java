package com.patrick.timetableappbackend.service;

import com.patrick.timetableappbackend.model.RestrictionRule;
import com.patrick.timetableappbackend.model.Room;
import com.patrick.timetableappbackend.model.RuleOperator;
import com.patrick.timetableappbackend.model.Timeslot;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Stateless utility that evaluates whether a Room or Timeslot matches a RestrictionRule.
 * <p>
 * This is the single extension point for adding new filterable fields.
 * To add a new field, add a new case in the corresponding switch statement.
 */
public final class RuleEvaluator {

    private RuleEvaluator() {
        // utility class
    }

    /**
     * Evaluates whether a room matches the given rule.
     * For specific-items mode, checks if the room ID is in the rule's specific set.
     * For criteria mode, evaluates the criteria field/operator/value against the room.
     */
    public static boolean matchesRoom(RestrictionRule rule, Room room) {
        if (rule.isSpecificItemsMode()) {
            return rule.getSpecificRoomIds().contains(room.getId());
        }
        String fieldValue = getRoomFieldValue(rule.getCriteriaField(), room);
        return evaluateOperator(rule.getOperator(), fieldValue, rule.getCriteriaValue(), rule.getCriteriaField());
    }

    /**
     * Evaluates whether a timeslot matches the given rule.
     * For specific-items mode, checks if the timeslot ID is in the rule's specific set.
     * For criteria mode, evaluates the criteria field/operator/value against the timeslot.
     */
    public static boolean matchesTimeslot(RestrictionRule rule, Timeslot timeslot) {
        if (rule.isSpecificItemsMode()) {
            return rule.getSpecificTimeslotIds().contains(timeslot.getId());
        }
        String fieldValue = getTimeslotFieldValue(rule.getCriteriaField(), timeslot);
        return evaluateOperator(rule.getOperator(), fieldValue, rule.getCriteriaValue(), rule.getCriteriaField());
    }

    private static String getRoomFieldValue(String field, Room room) {
        return switch (field.toLowerCase()) {
            case "name" -> room.getName();
            case "capacity" -> room.getCapacity() != null ? room.getCapacity().toString() : null;
            case "building" -> room.getBuilding();
            default -> throw new IllegalArgumentException("Unknown room field: " + field);
        };
    }

    private static String getTimeslotFieldValue(String field, Timeslot timeslot) {
        return switch (field.toLowerCase()) {
            case "dayofweek" -> timeslot.getDayOfWeek() != null ? timeslot.getDayOfWeek().name() : null;
            case "starttime" -> timeslot.getStartTime() != null ? timeslot.getStartTime().toString() : null;
            case "endtime" -> timeslot.getEndTime() != null ? timeslot.getEndTime().toString() : null;
            default -> throw new IllegalArgumentException("Unknown timeslot field: " + field);
        };
    }

    private static boolean evaluateOperator(RuleOperator operator, String fieldValue, String criteriaValue, String field) {
        if (fieldValue == null) {
            return false;
        }
        return switch (operator) {
            case EQUALS -> fieldValue.equalsIgnoreCase(criteriaValue);
            case NOT_EQUALS -> !fieldValue.equalsIgnoreCase(criteriaValue);
            case IN -> evaluateIn(fieldValue, criteriaValue);
            case NOT_IN -> !evaluateIn(fieldValue, criteriaValue);
            case GREATER_THAN_OR_EQUAL -> compareValues(fieldValue, criteriaValue, field) >= 0;
            case LESS_THAN -> compareValues(fieldValue, criteriaValue, field) < 0;
            case CONTAINS -> fieldValue.toLowerCase().contains(criteriaValue.toLowerCase());
        };
    }

    private static boolean evaluateIn(String fieldValue, String criteriaValue) {
        Set<String> values = Arrays.stream(criteriaValue.split(","))
                .map(String::trim)
                .map(String::toUpperCase)
                .collect(Collectors.toSet());
        return values.contains(fieldValue.toUpperCase());
    }

    /**
     * Compares two values appropriately based on the field type.
     * Numeric fields (capacity) use numeric comparison.
     * Time fields (startTime, endTime) use LocalTime comparison.
     * DayOfWeek fields use ordinal comparison.
     * All other fields use string comparison.
     */
    private static int compareValues(String fieldValue, String criteriaValue, String field) {
        return switch (field.toLowerCase()) {
            case "capacity" -> Long.compare(Long.parseLong(fieldValue), Long.parseLong(criteriaValue));
            case "starttime", "endtime" -> LocalTime.parse(fieldValue).compareTo(LocalTime.parse(criteriaValue));
            case "dayofweek" -> DayOfWeek.valueOf(fieldValue.toUpperCase()).compareTo(DayOfWeek.valueOf(criteriaValue.toUpperCase()));
            default -> fieldValue.compareToIgnoreCase(criteriaValue);
        };
    }
}
