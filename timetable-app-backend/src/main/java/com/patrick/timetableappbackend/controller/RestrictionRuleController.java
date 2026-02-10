package com.patrick.timetableappbackend.controller;

import com.patrick.timetableappbackend.model.RestrictionRule;
import com.patrick.timetableappbackend.model.RuleCombination;
import com.patrick.timetableappbackend.model.RuleTargetType;
import com.patrick.timetableappbackend.service.RestrictionRuleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

/**
 * REST controller for managing restriction rules and their associations with lessons.
 */
@RestController
@RequestMapping("/api/v1/restriction-rules")
@Tag(name = "Restriction Rules", description = "CRUD for restriction rules and lesson–rule associations")
@SecurityRequirement(name = "Bearer Authentication")
@RequiredArgsConstructor
public class RestrictionRuleController {

    private final RestrictionRuleService ruleService;

    // ==================== Rule CRUD ====================

    @Operation(summary = "Get all restriction rules")
    @GetMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<RestrictionRule>> getAll(
            @RequestParam(name = "targetType", required = false) RuleTargetType targetType) {
        List<RestrictionRule> rules = targetType != null
                ? ruleService.findByTargetType(targetType)
                : ruleService.findAll();
        return ResponseEntity.ok(rules);
    }

    @Operation(summary = "Get a restriction rule by ID")
    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<RestrictionRule> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ruleService.findById(id));
    }

    @Operation(summary = "Create a new restriction rule")
    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<RestrictionRule> create(@RequestBody RestrictionRule rule) {
        return new ResponseEntity<>(ruleService.create(rule), HttpStatus.CREATED);
    }

    @Operation(summary = "Update a restriction rule")
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<RestrictionRule> update(@PathVariable Long id, @RequestBody RestrictionRule rule) {
        return ResponseEntity.ok(ruleService.update(id, rule));
    }

    @Operation(summary = "Delete a restriction rule")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        ruleService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // ==================== Lesson–Rule Associations ====================

    @Operation(summary = "Get applied rules for a lesson")
    @GetMapping("/lessons/{lessonId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Map<String, Object>> getLessonRules(@PathVariable Long lessonId) {
        return ResponseEntity.ok(ruleService.getLessonRules(lessonId));
    }

    @Operation(summary = "Apply rules to a lesson",
               description = "Sets which rules apply and their AND/OR combination logic.")
    @PutMapping("/lessons/{lessonId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Map<String, Object>> applyRulesToLesson(
            @PathVariable Long lessonId,
            @RequestBody Map<String, Object> body) {

        @SuppressWarnings("unchecked")
        List<Long> ruleIds = body.get("ruleIds") != null
                ? ((List<Number>) body.get("ruleIds")).stream().map(Number::longValue).toList()
                : List.of();

        RuleCombination roomCombination = body.get("roomRuleCombination") != null
                ? RuleCombination.valueOf(body.get("roomRuleCombination").toString())
                : RuleCombination.AND;

        RuleCombination timeslotCombination = body.get("timeslotRuleCombination") != null
                ? RuleCombination.valueOf(body.get("timeslotRuleCombination").toString())
                : RuleCombination.AND;

        return ResponseEntity.ok(ruleService.applyRulesToLesson(lessonId, ruleIds, roomCombination, timeslotCombination));
    }

    @Operation(summary = "Clear all rules for a lesson")
    @DeleteMapping("/lessons/{lessonId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> clearLessonRules(@PathVariable Long lessonId) {
        ruleService.clearLessonRules(lessonId);
        return ResponseEntity.noContent().build();
    }
}
