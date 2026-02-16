package com.patrick.timetableappbackend.controller;

import com.patrick.timetableappbackend.model.RestrictionRule;
import com.patrick.timetableappbackend.model.RuleCombination;
import com.patrick.timetableappbackend.model.RuleTargetType;
import com.patrick.timetableappbackend.service.RestrictionRuleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/v1/restriction-rules")
@RequiredArgsConstructor
@Tag(name = "Assignment Rules", description = "Manage restriction rules for lesson-room/timeslot assignments")
@PreAuthorize("hasAuthority('ADMIN')")
public class RestrictionRuleController {

    private final RestrictionRuleService ruleService;

    @GetMapping
    @Operation(summary = "Get all restriction rules")
    public ResponseEntity<List<RestrictionRule>> getAllRules() {
        return ResponseEntity.ok(ruleService.getAllRules());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a restriction rule by ID")
    public ResponseEntity<RestrictionRule> getRuleById(@PathVariable Long id) {
        RestrictionRule rule = ruleService.getRuleById(id);
        if (rule == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(rule);
    }

    @GetMapping("/by-type/{targetType}")
    @Operation(summary = "Get all rules filtered by target type (ROOM or TIMESLOT)")
    public ResponseEntity<List<RestrictionRule>> getRulesByType(@PathVariable RuleTargetType targetType) {
        return ResponseEntity.ok(ruleService.getRulesByTargetType(targetType));
    }

    @PostMapping
    @Operation(summary = "Create a new restriction rule")
    public ResponseEntity<RestrictionRule> createRule(@RequestBody RestrictionRule rule) {
        return new ResponseEntity<>(ruleService.createRule(rule), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing restriction rule")
    public ResponseEntity<RestrictionRule> updateRule(@PathVariable Long id, @RequestBody RestrictionRule rule) {
        return ResponseEntity.ok(ruleService.updateRule(id, rule));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a restriction rule")
    public ResponseEntity<Void> deleteRule(@PathVariable Long id) {
        ruleService.deleteRule(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/preview/{id}")
    @Operation(summary = "Preview which rooms/timeslots match a rule")
    public ResponseEntity<Map<String, Object>> previewRule(@PathVariable Long id) {
        return ResponseEntity.ok(ruleService.previewRule(id));
    }

    // --- Lesson–Rule association endpoints ---

    @GetMapping("/lessons/{lessonId}")
    @Operation(summary = "Get all rules applied to a lesson")
    public ResponseEntity<Set<RestrictionRule>> getLessonRules(@PathVariable Long lessonId) {
        return ResponseEntity.ok(ruleService.getRulesForLesson(lessonId));
    }

    @PutMapping("/lessons/{lessonId}")
    @Operation(summary = "Apply rules to a lesson (replaces existing rules)")
    public ResponseEntity<Void> applyRulesToLesson(
            @PathVariable Long lessonId,
            @RequestBody ApplyRulesRequest request) {
        ruleService.applyRulesToLesson(
                lessonId,
                request.ruleIds(),
                request.roomRuleCombination(),
                request.timeslotRuleCombination()
        );
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/lessons/{lessonId}")
    @Operation(summary = "Clear all rules from a lesson")
    public ResponseEntity<Void> clearLessonRules(@PathVariable Long lessonId) {
        ruleService.clearRulesFromLesson(lessonId);
        return ResponseEntity.noContent().build();
    }

    public record ApplyRulesRequest(
            List<Long> ruleIds,
            RuleCombination roomRuleCombination,
            RuleCombination timeslotRuleCombination
    ) {}
}
