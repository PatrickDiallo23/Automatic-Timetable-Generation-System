package com.patrick.timetableappbackend.controller;

import ai.timefold.solver.core.api.score.analysis.ScoreAnalysis;
import ai.timefold.solver.core.api.score.buildin.hardsoft.HardSoftScore;
import ai.timefold.solver.core.api.solver.*;
import com.patrick.timetableappbackend.model.Timetable;
import com.patrick.timetableappbackend.service.TimetableService;
import jakarta.websocket.server.PathParam;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collection;
import java.util.HashMap;
import java.util.Map;


@RestController
@RequestMapping("/api/v1/timetables")
@RequiredArgsConstructor
public class TimetableController {

    private final TimetableService timetableService;

    @GetMapping("/list")
    public Collection<String> list() {
        return timetableService.getJobIds();
    }

    @GetMapping
    public ResponseEntity<Timetable> generateTimetableData() {
        Timetable timetable = timetableService.getTimetableData();
        return new ResponseEntity<>(timetable, HttpStatus.OK);
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, String>> solve(@RequestBody Timetable problem) {

        String jobId = timetableService.solve(problem);
        Map<String, String> response = new HashMap<>();
        response.put("jobId", jobId);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping(value = "/analyze", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ScoreAnalysis<HardSoftScore> analyze(@RequestBody Timetable problem,
                                                @RequestParam(name = "fetchPolicy", required = false) ScoreAnalysisFetchPolicy fetchPolicy) {
        return timetableService.analyze(problem, fetchPolicy);
    }

    @GetMapping(value = "/{jobId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public Timetable getTimeTable(@PathVariable("jobId") String jobId) {
        return timetableService.getTimetable(jobId);
    }

    @GetMapping(value = "/{jobId}/status", produces = MediaType.APPLICATION_JSON_VALUE)
    public Timetable getStatus(@PathVariable("jobId") String jobId) {
        return timetableService.getStatus(jobId);
    }

    @DeleteMapping(value = "/{jobId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public Timetable terminateSolving(@PathParam("jobId") String jobId) {
        return timetableService.terminateSolving(jobId);
    }
}
