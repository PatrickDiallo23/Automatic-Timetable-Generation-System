package com.patrick.timetableappbackend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import org.hibernate.Hibernate;

import java.util.Objects;

@Getter
@Setter
@ToString
@Entity
@Builder
@AllArgsConstructor
@NoArgsConstructor
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

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RuleCriteriaField criteriaField;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RuleOperator operator;

    @Column(nullable = false)
    private String criteriaValue;

    @Builder.Default
    @Column(nullable = false)
    private boolean active = true;

    public boolean matches(Room room) {
        if (targetType != RuleTargetType.ROOM) {
            return false;
        }
        String fieldValue = criteriaField.extractValue(room);
        return fieldValue != null && operator.evaluate(fieldValue, criteriaValue);
    }

    public boolean matches(Timeslot timeslot) {
        if (targetType != RuleTargetType.TIMESLOT) {
            return false;
        }
        String fieldValue = criteriaField.extractValue(timeslot);
        return fieldValue != null && operator.evaluate(fieldValue, criteriaValue);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || Hibernate.getClass(this) != Hibernate.getClass(o)) return false;
        RestrictionRule that = (RestrictionRule) o;
        return id != null && Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
