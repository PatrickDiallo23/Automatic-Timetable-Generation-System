package com.patrick.timetableappbackend.controller;

import ai.timefold.solver.core.api.score.analysis.ScoreAnalysis;
import ai.timefold.solver.core.api.score.buildin.hardmediumsoft.HardMediumSoftScore;
import ai.timefold.solver.core.api.solver.ScoreAnalysisFetchPolicy;
import com.patrick.timetableappbackend.model.Timetable;
import com.patrick.timetableappbackend.service.TimetableService;
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
import jakarta.websocket.server.PathParam;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collection;
import java.util.HashMap;
import java.util.Map;


@RestController
@RequestMapping("/api/v1/timetables")
@Tag(name = "Timetable Management", description = "Operations related to timetable management")
@SecurityRequirement(name = "Bearer Authentication")
@RequiredArgsConstructor
public class TimetableController {

    private final TimetableService timetableService;

    @Operation(summary = "List all job IDs", description = "Retrieve a collection of all job IDs")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved job IDs",
                    content = @Content(mediaType = "application/json", array = @ArraySchema(schema = @Schema(type = "string")))),
            @ApiResponse(responseCode = "400", description = "Bad request", content = @Content),
            @ApiResponse(responseCode = "401", description = "Unauthorized access", content = @Content),
            @ApiResponse(responseCode = "403", description = "Forbidden access", content = @Content),
            @ApiResponse(responseCode = "404", description = "Job IDs not found", content = @Content),
            @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content)
    })
    @GetMapping("/list")
    @PreAuthorize("hasAuthority('ADMIN')")
    public Collection<String> list() {
        return timetableService.getJobIds();
    }

    @Operation(summary = "Generate timetable data", description = "Generate and retrieve timetable data")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully generated timetable data",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = Timetable.class))),
            @ApiResponse(responseCode = "400", description = "Bad request", content = @Content),
            @ApiResponse(responseCode = "401", description = "Unauthorized access", content = @Content),
            @ApiResponse(responseCode = "403", description = "Forbidden access", content = @Content),
            @ApiResponse(responseCode = "404", description = "Timetable data not found", content = @Content),
            @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content)
    })
    @GetMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Timetable> generateTimetableData() {
        Timetable timetable = timetableService.getTimetableData();
        return new ResponseEntity<>(timetable, HttpStatus.OK);
    }

    @Operation(summary = "Solve timetable problem", description = "Submit a timetable problem for solving")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully submitted timetable problem",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = Map.class))),
            @ApiResponse(responseCode = "400", description = "Bad request", content = @Content),
            @ApiResponse(responseCode = "401", description = "Unauthorized access", content = @Content),
            @ApiResponse(responseCode = "403", description = "Forbidden access", content = @Content),
            @ApiResponse(responseCode = "404", description = "Timetable problem not found", content = @Content),
            @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content)
    })
    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Map<String, String>> solve(
            @Parameter(description = "Timetable problem to be solved", required = true)
            @RequestBody Timetable problem) {

        String jobId = timetableService.solve(problem);
        Map<String, String> response = new HashMap<>();
        response.put("jobId", jobId);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @Operation(summary = "Analyze timetable problem", description = "Analyze a timetable problem and retrieve score analysis")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully analyzed timetable problem",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ScoreAnalysis.class))),
            @ApiResponse(responseCode = "400", description = "Bad request", content = @Content),
            @ApiResponse(responseCode = "401", description = "Unauthorized access", content = @Content),
            @ApiResponse(responseCode = "403", description = "Forbidden access", content = @Content),
            @ApiResponse(responseCode = "404", description = "Timetable problem not found", content = @Content),
            @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content)
    })
    @PutMapping(value = "/analyze", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    @Parameters(value = {
            @Parameter(name = "fetchPolicy", description = "Fetch policy for score analysis",
                    schema = @Schema(type = "string", allowableValues = {"FETCH_ALL", "FETCH_MATCH_COUNT (for >= 1.16.0 versions)", "FETCH_SHALLOW"})),
            @Parameter(name = "problem", description = "Timetable problem to analyze", required = true, schema = @Schema(implementation = Timetable.class))
    })
    @PreAuthorize("hasAuthority('ADMIN')")
    public ScoreAnalysis<HardMediumSoftScore> analyze(@RequestBody Timetable problem,
                                                      @RequestParam(name = "fetchPolicy", required = false) ScoreAnalysisFetchPolicy fetchPolicy) {
        return timetableService.analyze(problem, fetchPolicy);
    }

    @Operation(summary = "Get timetable by job ID", description = "Retrieve a specific timetable by its job ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved timetable",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = Timetable.class))),
            @ApiResponse(responseCode = "400", description = "Bad request", content = @Content),
            @ApiResponse(responseCode = "401", description = "Unauthorized access", content = @Content),
            @ApiResponse(responseCode = "403", description = "Forbidden access", content = @Content),
            @ApiResponse(responseCode = "404", description = "Timetable not found", content = @Content),
            @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content)
    })
    @GetMapping(value = "/{jobId}", produces = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("hasAuthority('ADMIN') OR hasAuthority('USER')")
    public Timetable getTimeTable(
            @Parameter(description = "ID of the job to retrieve the timetable for", required = true)
            @PathVariable("jobId") String jobId) {
        return timetableService.getTimetable(jobId);
    }

    @Operation(summary = "Get status of a Timetable Generation job", description = "Retrieve the status of a specific job by its ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved job status",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = Timetable.class))),
            @ApiResponse(responseCode = "400", description = "Bad request", content = @Content),
            @ApiResponse(responseCode = "401", description = "Unauthorized access", content = @Content),
            @ApiResponse(responseCode = "403", description = "Forbidden access", content = @Content),
            @ApiResponse(responseCode = "404", description = "Job not found", content = @Content),
            @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content)
    })
    @GetMapping(value = "/{jobId}/status", produces = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("hasAuthority('ADMIN')")
    public Timetable getStatus(
            @Parameter(description = "ID of the job to retrieve the status for", required = true)
            @PathVariable("jobId") String jobId) {
        return timetableService.getStatus(jobId);
    }

    @Operation(summary = "Terminate solving of a Timetable Generation job", description = "Terminate the solving process for a specific job by its ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully terminated job",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = Timetable.class))),
            @ApiResponse(responseCode = "400", description = "Bad request", content = @Content),
            @ApiResponse(responseCode = "401", description = "Unauthorized access", content = @Content),
            @ApiResponse(responseCode = "403", description = "Forbidden access", content = @Content),
            @ApiResponse(responseCode = "404", description = "Job not found", content = @Content),
            @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content)
    })
    @DeleteMapping(value = "/{jobId}", produces = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("hasAuthority('ADMIN')")
    public Timetable terminateSolving(
            @Parameter(description = "ID of the job to terminate", required = true)
            @PathParam("jobId") String jobId) {
        return timetableService.terminateSolving(jobId);
    }
}
