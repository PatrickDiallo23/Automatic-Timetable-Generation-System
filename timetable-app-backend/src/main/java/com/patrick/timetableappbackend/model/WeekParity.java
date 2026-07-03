package com.patrick.timetableappbackend.model;

/**
 * Represents the week parity of a lesson — whether it occurs in even weeks,
 * odd weeks, or every week (weekly).
 *
 * <p>Used by Timefold constraints to allow lessons with non-overlapping
 * parities (e.g. ODD vs EVEN) to share the same timeslot and room
 * without triggering a conflict.</p>
 */
public enum WeekParity {

    EVEN, ODD, WEEKLY;

    /**
     * Returns {@code true} if this parity overlaps with the other parity,
     * meaning two lessons with these parities would actually occur in
     * the same physical week and therefore conflict.
     *
     * <ul>
     *   <li>{@code WEEKLY} overlaps with everything (it spans both weeks).</li>
     *   <li>{@code ODD} only overlaps with {@code ODD} and {@code WEEKLY}.</li>
     *   <li>{@code EVEN} only overlaps with {@code EVEN} and {@code WEEKLY}.</li>
     * </ul>
     */
    public boolean overlapsWith(WeekParity other) {
        if (this == WEEKLY || other == WEEKLY) {
            return true;
        }
        return this == other;
    }
}
