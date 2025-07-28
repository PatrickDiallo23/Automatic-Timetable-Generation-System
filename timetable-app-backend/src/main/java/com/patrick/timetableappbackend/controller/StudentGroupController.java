package com.patrick.timetableappbackend.controller;

import com.patrick.timetableappbackend.model.StudentGroup;
import com.patrick.timetableappbackend.service.StudentGroupService;
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
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/studentGroups")
@Tag(name = "Student Group Management", description = "Operations related to student groups management")
@SecurityRequirement(name = "Bearer Authentication")
@RequiredArgsConstructor
@Slf4j
public class StudentGroupController {

    private final StudentGroupService studentGroupService;

    @Operation(summary = "Get all student groups", description = "Retrieve a list of all student groups")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved student groups",
                    content = @Content(mediaType = "application/json", array = @ArraySchema(schema = @Schema(implementation = StudentGroup.class)))),
            @ApiResponse(responseCode = "400", description = "Bad request", content = @Content),
            @ApiResponse(responseCode = "401", description = "Unauthorized access", content = @Content),
            @ApiResponse(responseCode = "403", description = "Forbidden access", content = @Content),
            @ApiResponse(responseCode = "404", description = "Student groups not found", content = @Content),
            @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content)
    })
    @GetMapping
    public ResponseEntity<List<StudentGroup>> getAllStudentGroups() {
        List<StudentGroup> studentGroups = studentGroupService.getAllStudentGroups();
        return new ResponseEntity<>(studentGroups, HttpStatus.OK);
    }

    @Operation(summary = "Get student group by ID", description = "Retrieve a specific student group by its ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved student group",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = StudentGroup.class))),
            @ApiResponse(responseCode = "400", description = "Bad request", content = @Content),
            @ApiResponse(responseCode = "401", description = "Unauthorized access", content = @Content),
            @ApiResponse(responseCode = "403", description = "Forbidden access", content = @Content),
            @ApiResponse(responseCode = "404", description = "Student group not found", content = @Content),
            @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content)
    })
    @GetMapping("/{id}")
    public ResponseEntity<StudentGroup> getStudentGroupById(
            @Parameter(description = "ID of the student group to retrieve", required = true)
            @PathVariable Long id) {
        return studentGroupService.getStudentGroupById(id)
                .map(studentGroup -> new ResponseEntity<>(studentGroup, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @Operation(summary = "Get student group count", description = "Retrieve the total number of student groups")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved student group count",
                    content = @Content(mediaType = "application/json", schema = @Schema(type = "integer"))),
            @ApiResponse(responseCode = "400", description = "Bad request", content = @Content),
            @ApiResponse(responseCode = "401", description = "Unauthorized access", content = @Content),
            @ApiResponse(responseCode = "403", description = "Forbidden access", content = @Content),
            @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content)
    })
    @GetMapping("/count")
    public ResponseEntity<Long> getStudentGroupCount() {
        long studentGroupCount = studentGroupService.getStudentGroupCount();
        return new ResponseEntity<>(studentGroupCount, HttpStatus.OK);
    }

    @Operation(summary = "Create a new student group", description = "Create a new student group with the provided details")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Successfully created student group",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = StudentGroup.class))),
            @ApiResponse(responseCode = "400", description = "Bad request", content = @Content),
            @ApiResponse(responseCode = "403", description = "Forbidden access", content = @Content),
            @ApiResponse(responseCode = "401", description = "Unauthorized access", content = @Content),
            @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content)
    })
    @PostMapping
    public ResponseEntity<StudentGroup> createStudentGroup(
            @Parameter(description = "Details of the student group to create", required = true)
            @RequestBody StudentGroup studentGroup) {
        StudentGroup createdStudentGroup = studentGroupService.createStudentGroup(studentGroup);
        return new ResponseEntity<>(createdStudentGroup, HttpStatus.CREATED);
    }

    @Operation(summary = "Update an existing student group", description = "Update the details of an existing student group")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully updated student group",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = StudentGroup.class))),
            @ApiResponse(responseCode = "400", description = "Bad request", content = @Content),
            @ApiResponse(responseCode = "401", description = "Unauthorized access", content = @Content),
            @ApiResponse(responseCode = "403", description = "Forbidden access", content = @Content),
            @ApiResponse(responseCode = "404", description = "Student group not found", content = @Content),
            @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content)
    })
    @PutMapping("/{id}")
    @Parameters(value = {
            @Parameter(description = "ID of the student group to update", required = true),
            @Parameter(description = "Updated student group details", required = true)
    })
    public ResponseEntity<StudentGroup> updateStudentGroup(@PathVariable Long id, @RequestBody StudentGroup updatedStudentGroup) {
        try {
            StudentGroup updated = studentGroupService.updateStudentGroup(id, updatedStudentGroup);
            return new ResponseEntity<>(updated, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @Operation(summary = "Delete a student group", description = "Delete a student group by its ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Successfully deleted student group"),
            @ApiResponse(responseCode = "400", description = "Bad request", content = @Content),
            @ApiResponse(responseCode = "401", description = "Unauthorized access", content = @Content),
            @ApiResponse(responseCode = "403", description = "Forbidden access", content = @Content),
            @ApiResponse(responseCode = "404", description = "Student group not found", content = @Content),
            @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content)
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStudentGroup(
            @Parameter(description = "ID of the student group to delete", required = true)
            @PathVariable Long id) {
        studentGroupService.deleteStudentGroup(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
