package com.patrick.timetableappbackend.repository;

import com.patrick.timetableappbackend.model.RestrictionRule;
import com.patrick.timetableappbackend.model.RuleTargetType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface RestrictionRuleRepository extends JpaRepository<RestrictionRule, Long> {

    List<RestrictionRule> findAllByTargetType(RuleTargetType targetType);

    @Query("SELECT r FROM RestrictionRule r " +
            "LEFT JOIN FETCH r.specificRooms " +
            "LEFT JOIN FETCH r.specificTimeslots " +
            "ORDER BY r.name")
    List<RestrictionRule> findAllWithDetails();

    @Query("SELECT r FROM RestrictionRule r " +
            "LEFT JOIN FETCH r.specificRooms " +
            "LEFT JOIN FETCH r.specificTimeslots " +
            "WHERE r.id = :id")
    RestrictionRule findByIdWithDetails(Long id);
}
