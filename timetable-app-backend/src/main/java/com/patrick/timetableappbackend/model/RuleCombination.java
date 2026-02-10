package com.patrick.timetableappbackend.model;

/**
 * Defines how multiple rules of the same target type are combined
 * when applied to a lesson.
 * AND = entity must satisfy ALL rules (intersection)
 * OR  = entity must satisfy ANY rule (union)
 */
public enum RuleCombination {
    AND,
    OR
}
