package com.patrick.timetableappbackend.controller;

import com.patrick.timetableappbackend.model.ConstraintModel;
import com.patrick.timetableappbackend.service.ConstraintService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.Parameters;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.access.prepost.PreAuthorize;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/constraints")
@Tag(name = "Constraint Management", description = "Operations related to constraints management")
@SecurityRequirement(name = "Bearer Authentication")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasAuthority('ADMIN')")
public class ConstraintController {

    private final ConstraintService constraintService;

    @Operation(summary = "Get all constraints", description = "Retrieve a list of all constraints")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved constraints",
                    content = @Content(mediaType = "application/json",
                            array = @ArraySchema(schema = @Schema(implementation = ConstraintModel.class)))),
            @ApiResponse(responseCode = "400", description = "Bad request", content = @Content),
            @ApiResponse(responseCode = "401", description = "Unauthorized access", content = @Content),
            @ApiResponse(responseCode = "403", description = "Forbidden access", content = @Content),
            @ApiResponse(responseCode = "404", description = "Constraints not found", content = @Content),
            @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content)
    })
    @GetMapping
    public ResponseEntity<List<ConstraintModel>> getAllConstraints() {
        List<ConstraintModel> constraintModels = constraintService.getAllConstraints();
        return new ResponseEntity<>(constraintModels, HttpStatus.OK);
    }

    @Operation(summary = "Get constraint by ID", description = "Retrieve a specific constraint by its ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved constraint",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ConstraintModel.class))),
            @ApiResponse(responseCode = "400", description = "Bad request", content = @Content),
            @ApiResponse(responseCode = "401", description = "Unauthorized access", content = @Content),
            @ApiResponse(responseCode = "403", description = "Forbidden access", content = @Content),
            @ApiResponse(responseCode = "404", description = "Constraint not found", content = @Content),
            @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content)
    })
    @GetMapping("/{id}")
    public ResponseEntity<ConstraintModel> getConstraintById(
            @Parameter(description = "ID of the constraint to retrieve", required = true)
            @PathVariable Long id) {
        return constraintService.getConstraintById(id)
                .map(constraintModel -> new ResponseEntity<>(constraintModel, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @Operation(summary = "Get constraint count", description = "Retrieve the total number of constraints")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved constraint count",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(type = "integer"))),
            @ApiResponse(responseCode = "400", description = "Bad request", content = @Content),
            @ApiResponse(responseCode = "401", description = "Unauthorized access", content = @Content),
            @ApiResponse(responseCode = "403", description = "Forbidden access", content = @Content),
            @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content)
    })
    @GetMapping("/count")
    public ResponseEntity<Long> getConstraintCount() {
        long constraintCount = constraintService.getConstraintCount();
        return new ResponseEntity<>(constraintCount, HttpStatus.OK);
    }

    @Operation(summary = "Create a new constraint", description = "Add a new constraint to the system")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Successfully created constraint",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ConstraintModel.class))),
            @ApiResponse(responseCode = "400", description = "Bad request", content = @Content),
            @ApiResponse(responseCode = "401", description = "Unauthorized access", content = @Content),
            @ApiResponse(responseCode = "403", description = "Forbidden access", content = @Content),
            @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content)
    })
    @PostMapping
    public ResponseEntity<ConstraintModel> createConstraint(
            @Parameter(description = "Constraint model to be created", required = true)
            @RequestBody ConstraintModel constraintModel) {
        ConstraintModel createdConstraintModel = constraintService.createConstraint(constraintModel);
        return new ResponseEntity<>(createdConstraintModel, HttpStatus.CREATED);
    }

    @Operation(summary = "Update an existing constraint", description = "Modify an existing constraint by its ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully updated constraint",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ConstraintModel.class))),
            @ApiResponse(responseCode = "400", description = "Bad request", content = @Content),
            @ApiResponse(responseCode = "401", description = "Unauthorized access", content = @Content),
            @ApiResponse(responseCode = "403", description = "Forbidden access", content = @Content),
            @ApiResponse(responseCode = "404", description = "Constraint not found", content = @Content),
            @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content)
    })
    @PutMapping("/{id}")
    @Parameters(value = {
            @Parameter(name = "id", description = "ID of the constraint to update", required = true),
            @Parameter(name = "updatedConstraintModel", description = "Updated constraint model", required = true)
    })
    public ResponseEntity<ConstraintModel> updateConstraint(@PathVariable Long id, @RequestBody ConstraintModel updatedConstraintModel) {
        try {
            ConstraintModel updated = constraintService.updateConstraint(id, updatedConstraintModel);
            return new ResponseEntity<>(updated, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @Operation(summary = "Delete a constraint", description = "Remove a constraint by its ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Successfully deleted constraint"),
            @ApiResponse(responseCode = "400", description = "Bad request", content = @Content),
            @ApiResponse(responseCode = "401", description = "Unauthorized access", content = @Content),
            @ApiResponse(responseCode = "403", description = "Forbidden access", content = @Content),
            @ApiResponse(responseCode = "404", description = "Constraint not found", content = @Content),
            @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content)
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteConstraint(
            @Parameter(description = "ID of the constraint to delete", required = true)
            @PathVariable Long id) {
        constraintService.deleteConstraint(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
