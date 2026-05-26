package com.patrick.timetableappbackend.model;

import java.util.Set;

public enum RuleCriteriaField {

    NAME(RuleTargetType.ROOM) {
        @Override
        public String extractValue(Room room) {
            return room.getName();
        }
    },
    BUILDING(RuleTargetType.ROOM) {
        @Override
        public String extractValue(Room room) {
            return room.getBuilding();
        }
    },
    CAPACITY(RuleTargetType.ROOM) {
        @Override
        public String extractValue(Room room) {
            return String.valueOf(room.getCapacity());
        }
    },
    DAY_OF_WEEK(RuleTargetType.TIMESLOT) {
        @Override
        public String extractValue(Timeslot timeslot) {
            return timeslot.getDayOfWeek().name();
        }

        @Override
        public Set<RuleOperator> allowedOperators() {
            return Set.of(RuleOperator.EQUALS, RuleOperator.NOT_EQUALS, RuleOperator.IN);
        }
    },
    START_TIME(RuleTargetType.TIMESLOT) {
        @Override
        public String extractValue(Timeslot timeslot) {
            return timeslot.getStartTime().toString();
        }
    },
    END_TIME(RuleTargetType.TIMESLOT) {
        @Override
        public String extractValue(Timeslot timeslot) {
            return timeslot.getEndTime().toString();
        }
    };

    private final RuleTargetType targetType;

    RuleCriteriaField(RuleTargetType targetType) {
        this.targetType = targetType;
    }

    public RuleTargetType getTargetType() {
        return targetType;
    }

    public String extractValue(Room room) {
        throw new UnsupportedOperationException(
                "Field " + name() + " does not apply to Room");
    }

    public String extractValue(Timeslot timeslot) {
        throw new UnsupportedOperationException(
                "Field " + name() + " does not apply to Timeslot");
    }

    public Set<RuleOperator> allowedOperators() {
        return Set.of(RuleOperator.values());
    }
}
