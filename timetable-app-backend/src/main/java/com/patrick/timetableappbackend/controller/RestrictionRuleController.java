package com.patrick.timetableappbackend.controller;

import com.patrick.timetableappbackend.model.RestrictionRule;
import com.patrick.timetableappbackend.service.RestrictionRuleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/restriction-rules")
@RequiredArgsConstructor
@Tag(name = "Restriction Rule Management")
public class RestrictionRuleController {

    private final RestrictionRuleService restrictionRuleService;

    @GetMapping
    @Operation(summary = "Get all restriction rules")
    public ResponseEntity<List<RestrictionRule>> getAllRules() {
        return ResponseEntity.ok(restrictionRuleService.getAllRules());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get restriction rule by ID")
    public ResponseEntity<RestrictionRule> getRuleById(@PathVariable Long id) {
        return restrictionRuleService.getRuleById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @Operation(summary = "Create a new restriction rule")
    public ResponseEntity<RestrictionRule> createRule(@RequestBody RestrictionRule rule) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(restrictionRuleService.createRule(rule));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing restriction rule")
    public ResponseEntity<RestrictionRule> updateRule(@PathVariable Long id, @RequestBody RestrictionRule rule) {
        return ResponseEntity.ok(restrictionRuleService.updateRule(id, rule));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a restriction rule")
    public ResponseEntity<Void> deleteRule(@PathVariable Long id) {
        restrictionRuleService.deleteRule(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/count")
    @Operation(summary = "Get total number of restriction rules")
    public ResponseEntity<Long> getRuleCount() {
        return ResponseEntity.ok(restrictionRuleService.getRuleCount());
    }
}
