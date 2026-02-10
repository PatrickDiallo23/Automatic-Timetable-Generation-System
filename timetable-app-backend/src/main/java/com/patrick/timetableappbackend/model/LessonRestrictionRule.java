package com.patrick.timetableappbackend.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Junction entity linking a Lesson to a RestrictionRule.
 * A lesson can have multiple rules applied; a rule can be reused across lessons.
 */
@Entity
@Table(
    name = "lesson_restriction_rule",
    uniqueConstraints = @UniqueConstraint(columnNames = {"lesson_id", "rule_id"})
)
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class LessonRestrictionRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "lesson_id", nullable = false)
    private Lesson lesson;

    @ManyToOne
    @JoinColumn(name = "rule_id", nullable = false)
    private RestrictionRule rule;

    public LessonRestrictionRule(Lesson lesson, RestrictionRule rule) {
        this.lesson = lesson;
        this.rule = rule;
    }
}
