package com.patrick.timetableappbackend.model;

/**
 * Comparison operators for criteria-based restriction rules.
 * Used only when the rule is in criteria mode (not specific-items mode).
 */
public enum RuleOperator {
    EQUALS,
    NOT_EQUALS,
    IN,
    NOT_IN,
    GREATER_THAN_OR_EQUAL,
    LESS_THAN,
    CONTAINS
}
