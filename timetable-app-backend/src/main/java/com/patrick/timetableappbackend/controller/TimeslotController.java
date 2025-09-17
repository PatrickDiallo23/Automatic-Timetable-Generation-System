package com.patrick.timetableappbackend.controller;

import com.patrick.timetableappbackend.dto.TimeslotRequest;
import com.patrick.timetableappbackend.model.Timeslot;
import com.patrick.timetableappbackend.service.TimeslotService;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.Parameters;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.security.access.prepost.PreAuthorize;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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

import java.time.DayOfWeek;
import java.util.List;

@RestController
@RequestMapping("/api/v1/timeslots")
@Tag(name = "Timeslot Management", description = "Operations related to timeslots management")
@SecurityRequirement(name = "Bearer Authentication")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasAuthority('ADMIN')")
public class TimeslotController {

    private final TimeslotService timeslotService;

    @Operation(summary = "Get all timeslots", description = "Retrieve a list of all timeslots")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved timeslots",
                    content = @Content(mediaType = "application/json", array = @ArraySchema(schema = @Schema(implementation = Timeslot.class)))),
            @ApiResponse(responseCode = "400", description = "Bad request", content = @Content),
            @ApiResponse(responseCode = "401", description = "Unauthorized access", content = @Content),
            @ApiResponse(responseCode = "403", description = "Forbidden access", content = @Content),
            @ApiResponse(responseCode = "404", description = "Timeslots not found", content = @Content),
            @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content)
    })
    @GetMapping
    public ResponseEntity<List<Timeslot>> getAllTimeslots() {
        List<Timeslot> timeslots = timeslotService.getAllTimeslots();
        return new ResponseEntity<>(timeslots, HttpStatus.OK);
    }

    @Operation(summary = "Get timeslot by ID", description = "Retrieve a specific timeslot by its ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved timeslot",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = Timeslot.class))),
            @ApiResponse(responseCode = "400", description = "Bad request", content = @Content),
            @ApiResponse(responseCode = "401", description = "Unauthorized access", content = @Content),
            @ApiResponse(responseCode = "403", description = "Forbidden access", content = @Content),
            @ApiResponse(responseCode = "404", description = "Timeslot not found", content = @Content),
            @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content)
    })
    @GetMapping("/{id}")
    public ResponseEntity<Timeslot> getTimeslotById(
            @Parameter(description = "ID of the timeslot to retrieve", required = true)
            @PathVariable Long id) {
        return timeslotService.getTimeslotById(id)
                .map(timeslot -> new ResponseEntity<>(timeslot, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @Operation(summary = "Get timeslot count", description = "Retrieve the total number of timeslots")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved timeslot count",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = Long.class))),
            @ApiResponse(responseCode = "400", description = "Bad request", content = @Content),
            @ApiResponse(responseCode = "401", description = "Unauthorized access", content = @Content),
            @ApiResponse(responseCode = "403", description = "Forbidden access", content = @Content),
            @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content)
    })
    @GetMapping("/count")
    public ResponseEntity<Long> getTimeslotCount() {
        long timeslotCount = timeslotService.getTimeslotCount();
        return new ResponseEntity<>(timeslotCount, HttpStatus.OK);
    }

    @Operation(summary = "Create a new timeslot", description = "Create a new timeslot with specified day of week, start time, and end time")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Successfully created timeslot",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = Timeslot.class))),
            @ApiResponse(responseCode = "400", description = "Bad request", content = @Content),
            @ApiResponse(responseCode = "401", description = "Unauthorized access", content = @Content),
            @ApiResponse(responseCode = "403", description = "Forbidden access", content = @Content),
            @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content)
    })
    @PostMapping
    public ResponseEntity<Timeslot> createTimeslot(
            @Parameter(description = "Timeslot request containing day of week, start time, and end time", required = true)
            @RequestBody TimeslotRequest timeslot) {
        DayOfWeek dayOfWeek = DayOfWeek.of(timeslot.getDayOfWeek());
        Timeslot requestTimeslot = Timeslot.builder()
                .dayOfWeek(dayOfWeek)
                .startTime(timeslot.getStartTime())
                .endTime(timeslot.getEndTime())
                .build();
        Timeslot createdTimeslot = timeslotService.createTimeslot(requestTimeslot);
        return new ResponseEntity<>(createdTimeslot, HttpStatus.CREATED);
    }

    @Operation(summary = "Update an existing timeslot", description = "Update an existing timeslot's details")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully updated timeslot",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = Timeslot.class))),
            @ApiResponse(responseCode = "400", description = "Bad request", content = @Content),
            @ApiResponse(responseCode = "401", description = "Unauthorized access", content = @Content),
            @ApiResponse(responseCode = "403", description = "Forbidden access", content = @Content),
            @ApiResponse(responseCode = "404", description = "Timeslot not found", content = @Content),
            @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content)
    })
    @PutMapping("/{id}")
    @Parameters(value = {
            @Parameter(description = "ID of the timeslot to update", required = true),
            @Parameter(description = "Updated timeslot details", required = true)
    })
    public ResponseEntity<Timeslot> updateTimeslot(@PathVariable Long id, @RequestBody Timeslot updatedTimeslot) {
        try {
            Timeslot updated = timeslotService.updateTimeslot(id, updatedTimeslot);
            return new ResponseEntity<>(updated, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @Operation(summary = "Delete a timeslot", description = "Delete a timeslot by its ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Successfully deleted timeslot"),
            @ApiResponse(responseCode = "400", description = "Bad request", content = @Content),
            @ApiResponse(responseCode = "401", description = "Unauthorized access", content = @Content),
            @ApiResponse(responseCode = "403", description = "Forbidden access", content = @Content),
            @ApiResponse(responseCode = "404", description = "Timeslot not found", content = @Content),
            @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content)
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTimeslot(
            @Parameter(description = "ID of the timeslot to delete", required = true)
            @PathVariable Long id) {
        timeslotService.deleteTimeslot(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
