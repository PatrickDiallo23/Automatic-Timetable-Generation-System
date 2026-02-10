package com.patrick.timetableappbackend.model;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.util.HashSet;
import java.util.Set;

/**
 * A reusable restriction rule that can be applied to any number of lessons.
 * Supports two modes:
 * <ul>
 *   <li><b>Criteria mode</b>: filters by field/operator/value (e.g., building EQUALS "A")</li>
 *   <li><b>Specific items mode</b>: selects exact rooms or timeslots by ID</li>
 * </ul>
 * When criteriaField is null, the rule operates in specific-items mode.
 */
@Entity
@Table(name = "restriction_rule")
@Getter
@Setter
@ToString
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RestrictionRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RuleTargetType targetType;

    // --- Criteria mode fields (null when using specific items) ---

    /** The entity field to filter on: "building", "capacity", "name", "dayOfWeek", "startTime", "endTime" */
    private String criteriaField;

    @Enumerated(EnumType.STRING)
    private RuleOperator operator;

    /** The value(s) to compare against. For IN/NOT_IN, comma-separated. */
    private String criteriaValue;

    // --- Specific items mode (empty when using criteria) ---

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "restriction_rule_specific_rooms", joinColumns = @JoinColumn(name = "rule_id"))
    @Column(name = "room_id")
    @Builder.Default
    private Set<Long> specificRoomIds = new HashSet<>();

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "restriction_rule_specific_timeslots", joinColumns = @JoinColumn(name = "rule_id"))
    @Column(name = "timeslot_id")
    @Builder.Default
    private Set<Long> specificTimeslotIds = new HashSet<>();

    /**
     * Returns true if this rule operates in specific-items mode
     * (selecting exact rooms/timeslots by ID rather than filtering by criteria).
     */
    public boolean isSpecificItemsMode() {
        return criteriaField == null || criteriaField.isBlank();
    }
}
