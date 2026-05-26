package com.patrick.timetableappbackend.service;

import com.patrick.timetableappbackend.model.RestrictionRule;
import com.patrick.timetableappbackend.repository.RestrictionRuleRepo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class RestrictionRuleService {

    private final RestrictionRuleRepo restrictionRuleRepo;

    @Transactional(readOnly = true)
    public List<RestrictionRule> getAllRules() {
        return restrictionRuleRepo.findAll();
    }

    @Transactional(readOnly = true)
    public List<RestrictionRule> getActiveRules() {
        return restrictionRuleRepo.findByActiveTrue();
    }

    @Transactional(readOnly = true)
    public Optional<RestrictionRule> getRuleById(Long id) {
        return restrictionRuleRepo.findById(id);
    }

    @Transactional
    public RestrictionRule createRule(RestrictionRule rule) {
        log.info("Creating restriction rule: {}", rule.getName());
        return restrictionRuleRepo.save(rule);
    }

    @Transactional
    public RestrictionRule updateRule(Long id, RestrictionRule updatedRule) {
        return restrictionRuleRepo.findById(id)
                .map(existing -> {
                    existing.setName(updatedRule.getName());
                    existing.setTargetType(updatedRule.getTargetType());
                    existing.setCriteriaField(updatedRule.getCriteriaField());
                    existing.setOperator(updatedRule.getOperator());
                    existing.setCriteriaValue(updatedRule.getCriteriaValue());
                    existing.setActive(updatedRule.isActive());
                    return restrictionRuleRepo.save(existing);
                })
                .orElseThrow(() -> new RuntimeException("Restriction rule not found with id " + id));
    }

    @Transactional
    public void deleteRule(Long id) {
        log.info("Deleting restriction rule with id: {}", id);
        restrictionRuleRepo.deleteById(id);
    }

    public long getRuleCount() {
        return restrictionRuleRepo.count();
    }
}
