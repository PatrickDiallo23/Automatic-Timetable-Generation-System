package com.patrick.timetableappbackend.repository;

import com.patrick.timetableappbackend.model.RestrictionRule;
import com.patrick.timetableappbackend.model.RuleTargetType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RestrictionRuleRepository extends JpaRepository<RestrictionRule, Long> {

    List<RestrictionRule> findByTargetType(RuleTargetType targetType);
}
