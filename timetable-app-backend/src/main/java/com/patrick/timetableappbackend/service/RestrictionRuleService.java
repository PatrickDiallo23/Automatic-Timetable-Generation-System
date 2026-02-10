package com.patrick.timetableappbackend.service;

import com.patrick.timetableappbackend.model.Lesson;
import com.patrick.timetableappbackend.model.RestrictionRule;
import com.patrick.timetableappbackend.model.RuleCombination;
import com.patrick.timetableappbackend.model.RuleTargetType;
import com.patrick.timetableappbackend.repository.LessonRepo;
import com.patrick.timetableappbackend.repository.RestrictionRuleRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Service for managing reusable restriction rules and their associations with lessons.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RestrictionRuleService {

    private final RestrictionRuleRepository ruleRepository;
    private final LessonRepo lessonRepository;

    // ==================== Rule CRUD ====================

    public List<RestrictionRule> findAll() {
        return ruleRepository.findAll();
    }

    public List<RestrictionRule> findByTargetType(RuleTargetType targetType) {
        return ruleRepository.findByTargetType(targetType);
    }

    public RestrictionRule findById(Long id) {
        return ruleRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("RestrictionRule not found with id: " + id));
    }

    @Transactional
    public RestrictionRule create(RestrictionRule rule) {
        return ruleRepository.save(rule);
    }

    @Transactional
    public RestrictionRule update(Long id, RestrictionRule updatedRule) {
        RestrictionRule existing = findById(id);
        existing.setName(updatedRule.getName());
        existing.setTargetType(updatedRule.getTargetType());
        existing.setCriteriaField(updatedRule.getCriteriaField());
        existing.setOperator(updatedRule.getOperator());
        existing.setCriteriaValue(updatedRule.getCriteriaValue());
        existing.getSpecificRoomIds().clear();
        existing.getSpecificRoomIds().addAll(updatedRule.getSpecificRoomIds());
        existing.getSpecificTimeslotIds().clear();
        existing.getSpecificTimeslotIds().addAll(updatedRule.getSpecificTimeslotIds());
        return ruleRepository.save(existing);
    }

    @Transactional
    public void delete(Long id) {
        ruleRepository.deleteById(id);
    }

    // ==================== Lesson–Rule Associations ====================

    /**
     * Get the applied rule IDs and combination settings for a lesson.
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getLessonRules(Long lessonId) {
        Lesson lesson = lessonRepository.findLessonsById(lessonId)
                .orElseThrow(() -> new EntityNotFoundException("Lesson not found with id: " + lessonId));

        List<Long> ruleIds = lesson.getRestrictionRules().stream()
                .map(lr -> lr.getRule().getId())
                .toList();

        Map<String, Object> result = new HashMap<>();
        result.put("lessonId", lessonId);
        result.put("ruleIds", ruleIds);
        result.put("roomRuleCombination",
                lesson.getRoomRuleCombination() != null ? lesson.getRoomRuleCombination() : RuleCombination.AND);
        result.put("timeslotRuleCombination",
                lesson.getTimeslotRuleCombination() != null ? lesson.getTimeslotRuleCombination() : RuleCombination.AND);
        return result;
    }

    /**
     * Apply rules to a lesson and configure combination logic.
     */
    @Transactional
    public Map<String, Object> applyRulesToLesson(Long lessonId, List<Long> ruleIds,
                                                   RuleCombination roomCombination,
                                                   RuleCombination timeslotCombination) {
        Lesson lesson = lessonRepository.findLessonsById(lessonId)
                .orElseThrow(() -> new EntityNotFoundException("Lesson not found with id: " + lessonId));

        // Clear existing rule associations
        lesson.clearRestrictionRules();
        lessonRepository.flush();

        // Set combination logic
        if (roomCombination != null) {
            lesson.setRoomRuleCombination(roomCombination);
        }
        if (timeslotCombination != null) {
            lesson.setTimeslotRuleCombination(timeslotCombination);
        }

        // Add new rule associations
        if (ruleIds != null && !ruleIds.isEmpty()) {
            List<RestrictionRule> rules = ruleRepository.findAllById(ruleIds);

            // Validate all rules exist
            if (rules.size() != ruleIds.size()) {
                Set<Long> foundIds = rules.stream().map(RestrictionRule::getId).collect(Collectors.toSet());
                Set<Long> missingIds = new HashSet<>(ruleIds);
                missingIds.removeAll(foundIds);
                log.warn("Some rule IDs were not found: {}", missingIds);
            }

            rules.forEach(lesson::addRestrictionRule);
            log.info("Applied {} rules to lesson {}", rules.size(), lessonId);
        } else {
            log.info("Cleared all rules for lesson {}", lessonId);
        }

        lessonRepository.save(lesson);
        return getLessonRules(lessonId);
    }

    /**
     * Clear all rules from a lesson.
     */
    @Transactional
    public void clearLessonRules(Long lessonId) {
        Lesson lesson = lessonRepository.findLessonsById(lessonId)
                .orElseThrow(() -> new EntityNotFoundException("Lesson not found with id: " + lessonId));

        lesson.clearRestrictionRules();
        lessonRepository.save(lesson);
        log.info("Cleared all rules for lesson {}", lessonId);
    }
}
