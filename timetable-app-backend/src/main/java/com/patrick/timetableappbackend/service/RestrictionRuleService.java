package com.patrick.timetableappbackend.service;

import com.patrick.timetableappbackend.model.Lesson;
import com.patrick.timetableappbackend.model.RestrictionRule;
import com.patrick.timetableappbackend.model.Room;
import com.patrick.timetableappbackend.model.RuleCombination;
import com.patrick.timetableappbackend.model.RuleTargetType;
import com.patrick.timetableappbackend.model.Timeslot;
import com.patrick.timetableappbackend.repository.LessonRepo;
import com.patrick.timetableappbackend.repository.RestrictionRuleRepository;
import com.patrick.timetableappbackend.repository.RoomRepo;
import com.patrick.timetableappbackend.repository.TimeslotRepo;
import com.patrick.timetableappbackend.utils.RuleEvaluator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class RestrictionRuleService {

    private final RestrictionRuleRepository ruleRepository;
    private final LessonRepo lessonRepo;
    private final RoomRepo roomRepo;
    private final TimeslotRepo timeslotRepo;

    @Transactional(readOnly = true)
    public List<RestrictionRule> getAllRules() {
        return ruleRepository.findAllWithDetails();
    }

    @Transactional(readOnly = true)
    public RestrictionRule getRuleById(Long id) {
        return ruleRepository.findByIdWithDetails(id);
    }

    @Transactional(readOnly = true)
    public List<RestrictionRule> getRulesByTargetType(RuleTargetType targetType) {
        return ruleRepository.findAllByTargetType(targetType);
    }

    @Transactional
    public RestrictionRule createRule(RestrictionRule rule) {
        resolveSpecificItems(rule);
        return ruleRepository.save(rule);
    }

    @Transactional
    public RestrictionRule updateRule(Long id, RestrictionRule updatedRule) {
        RestrictionRule existing = ruleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rule not found with id " + id));

        existing.setName(updatedRule.getName());
        existing.setTargetType(updatedRule.getTargetType());
        existing.setCriteriaField(updatedRule.getCriteriaField());
        existing.setOperator(updatedRule.getOperator());
        existing.setCriteriaValue(updatedRule.getCriteriaValue());
        existing.getSpecificRooms().clear();
        existing.getSpecificTimeslots().clear();

        if (updatedRule.getSpecificRooms() != null) {
            updatedRule.getSpecificRooms().forEach(room -> {
                Room managed = roomRepo.findById(room.getId())
                        .orElseThrow(() -> new RuntimeException("Room not found with id " + room.getId()));
                existing.getSpecificRooms().add(managed);
            });
        }
        if (updatedRule.getSpecificTimeslots() != null) {
            updatedRule.getSpecificTimeslots().forEach(ts -> {
                Timeslot managed = timeslotRepo.findById(ts.getId())
                        .orElseThrow(() -> new RuntimeException("Timeslot not found with id " + ts.getId()));
                existing.getSpecificTimeslots().add(managed);
            });
        }

        return ruleRepository.save(existing);
    }

    @Transactional
    public void deleteRule(Long id) {
        // Remove the rule from all lessons that reference it before deleting
        List<Lesson> lessons = lessonRepo.findAllWithRestrictionRules();
        for (Lesson lesson : lessons) {
            lesson.getRestrictionRules().removeIf(r -> r.getId().equals(id));
            lessonRepo.save(lesson);
        }
        ruleRepository.deleteById(id);
    }

    @Transactional
    public Lesson applyRulesToLesson(Long lessonId, List<Long> ruleIds,
                                     RuleCombination roomCombination,
                                     RuleCombination timeslotCombination) {
        Lesson lesson = lessonRepo.findLessonsById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found with id " + lessonId));

        Set<RestrictionRule> rules = new HashSet<>(ruleRepository.findAllById(ruleIds));
        lesson.setRestrictionRules(rules);
        lesson.setRoomRuleCombination(roomCombination != null ? roomCombination : RuleCombination.AND);
        lesson.setTimeslotRuleCombination(timeslotCombination != null ? timeslotCombination : RuleCombination.AND);

        return lessonRepo.save(lesson);
    }

    @Transactional(readOnly = true)
    public Set<RestrictionRule> getRulesForLesson(Long lessonId) {
        Lesson lesson = lessonRepo.findWithRestrictionRulesById(lessonId);
        if (lesson == null) {
            throw new RuntimeException("Lesson not found with id " + lessonId);
        }
        return lesson.getRestrictionRules();
    }

    @Transactional
    public Lesson clearRulesFromLesson(Long lessonId) {
        Lesson lesson = lessonRepo.findLessonsById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found with id " + lessonId));
        lesson.getRestrictionRules().clear();
        lesson.setRoomRuleCombination(RuleCombination.AND);
        lesson.setTimeslotRuleCombination(RuleCombination.AND);
        return lessonRepo.save(lesson);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> previewRule(Long ruleId) {
        RestrictionRule rule = ruleRepository.findByIdWithDetails(ruleId);
        if (rule == null) {
            throw new RuntimeException("Rule not found with id " + ruleId);
        }

        Map<String, Object> result = new HashMap<>();
        if (rule.getTargetType() == RuleTargetType.ROOM) {
            List<Room> allRooms = roomRepo.findAll();
            List<Room> matched = RuleEvaluator.filterRooms(allRooms, Set.of(rule), RuleCombination.AND);
            result.put("matchedCount", matched.size());
            result.put("totalCount", allRooms.size());
            result.put("matchedItems", matched);
        } else {
            List<Timeslot> allTimeslots = timeslotRepo.findAll();
            List<Timeslot> matched = RuleEvaluator.filterTimeslots(allTimeslots, Set.of(rule), RuleCombination.AND);
            result.put("matchedCount", matched.size());
            result.put("totalCount", allTimeslots.size());
            result.put("matchedItems", matched);
        }
        return result;
    }

    private void resolveSpecificItems(RestrictionRule rule) {
        if (rule.getSpecificRooms() != null && !rule.getSpecificRooms().isEmpty()) {
            Set<Room> resolved = new HashSet<>();
            rule.getSpecificRooms().forEach(room -> {
                Room managed = roomRepo.findById(room.getId())
                        .orElseThrow(() -> new RuntimeException("Room not found with id " + room.getId()));
                resolved.add(managed);
            });
            rule.setSpecificRooms(resolved);
        }
        if (rule.getSpecificTimeslots() != null && !rule.getSpecificTimeslots().isEmpty()) {
            Set<Timeslot> resolved = new HashSet<>();
            rule.getSpecificTimeslots().forEach(ts -> {
                Timeslot managed = timeslotRepo.findById(ts.getId())
                        .orElseThrow(() -> new RuntimeException("Timeslot not found with id " + ts.getId()));
                resolved.add(managed);
            });
            rule.setSpecificTimeslots(resolved);
        }
    }
}
