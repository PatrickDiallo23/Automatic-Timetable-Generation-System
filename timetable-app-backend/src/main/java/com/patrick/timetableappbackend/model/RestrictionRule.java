package com.patrick.timetableappbackend.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

@Entity
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class RestrictionRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false, unique = true, updatable = false)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RuleTargetType targetType;

    // --- Criteria mode fields (null when using specific items) ---
    private String criteriaField;

    @Enumerated(EnumType.STRING)
    private RuleOperator operator;

    private String criteriaValue;

    // --- Specific items mode (empty when using criteria) ---
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "restriction_rule_specific_rooms",
            joinColumns = @JoinColumn(name = "rule_id"),
            inverseJoinColumns = @JoinColumn(name = "room_id")
    )
    @Builder.Default
    private Set<Room> specificRooms = new HashSet<>();

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "restriction_rule_specific_timeslots",
            joinColumns = @JoinColumn(name = "rule_id"),
            inverseJoinColumns = @JoinColumn(name = "timeslot_id")
    )
    @Builder.Default
    private Set<Timeslot> specificTimeslots = new HashSet<>();

    public boolean isCriteriaMode() {
        return criteriaField != null && operator != null && criteriaValue != null;
    }

    public boolean isSpecificItemsMode() {
        return !isCriteriaMode();
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        RestrictionRule that = (RestrictionRule) o;
        return id != null && Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
