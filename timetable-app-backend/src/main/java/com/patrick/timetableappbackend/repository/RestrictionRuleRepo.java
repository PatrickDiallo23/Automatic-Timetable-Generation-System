package com.patrick.timetableappbackend.repository;

import com.patrick.timetableappbackend.model.RestrictionRule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RestrictionRuleRepo extends JpaRepository<RestrictionRule, Long> {

    List<RestrictionRule> findByActiveTrue();
}
