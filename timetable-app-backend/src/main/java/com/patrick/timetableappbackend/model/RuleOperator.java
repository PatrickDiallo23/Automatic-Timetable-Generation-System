package com.patrick.timetableappbackend.model;

import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;

public enum RuleOperator {

    EQUALS {
        @Override
        public boolean evaluate(String fieldValue, String criteriaValue) {
            return fieldValue.equalsIgnoreCase(criteriaValue);
        }
    },
    NOT_EQUALS {
        @Override
        public boolean evaluate(String fieldValue, String criteriaValue) {
            return !fieldValue.equalsIgnoreCase(criteriaValue);
        }
    },
    STARTS_WITH {
        @Override
        public boolean evaluate(String fieldValue, String criteriaValue) {
            return fieldValue.toLowerCase().startsWith(criteriaValue.toLowerCase());
        }
    },
    CONTAINS {
        @Override
        public boolean evaluate(String fieldValue, String criteriaValue) {
            return fieldValue.toLowerCase().contains(criteriaValue.toLowerCase());
        }
    },
    LESS_THAN {
        @Override
        public boolean evaluate(String fieldValue, String criteriaValue) {
            return compareNumericOrLexicographic(fieldValue, criteriaValue) < 0;
        }
    },
    GREATER_THAN {
        @Override
        public boolean evaluate(String fieldValue, String criteriaValue) {
            return compareNumericOrLexicographic(fieldValue, criteriaValue) > 0;
        }
    },
    LESS_THAN_OR_EQUAL {
        @Override
        public boolean evaluate(String fieldValue, String criteriaValue) {
            return compareNumericOrLexicographic(fieldValue, criteriaValue) <= 0;
        }
    },
    GREATER_THAN_OR_EQUAL {
        @Override
        public boolean evaluate(String fieldValue, String criteriaValue) {
            return compareNumericOrLexicographic(fieldValue, criteriaValue) >= 0;
        }
    },
    IN {
        @Override
        public boolean evaluate(String fieldValue, String criteriaValue) {
            Set<String> values = Arrays.stream(criteriaValue.split(","))
                    .map(String::trim)
                    .map(String::toLowerCase)
                    .collect(Collectors.toSet());
            return values.contains(fieldValue.toLowerCase());
        }
    };

    public abstract boolean evaluate(String fieldValue, String criteriaValue);

    private static int compareNumericOrLexicographic(String a, String b) {
        try {
            return Double.compare(Double.parseDouble(a), Double.parseDouble(b));
        } catch (NumberFormatException e) {
            return a.compareToIgnoreCase(b);
        }
    }
}
