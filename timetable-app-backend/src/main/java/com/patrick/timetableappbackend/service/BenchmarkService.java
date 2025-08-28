package com.patrick.timetableappbackend.service;

import ai.timefold.solver.benchmark.api.PlannerBenchmark;
import ai.timefold.solver.benchmark.api.PlannerBenchmarkFactory;
import ai.timefold.solver.benchmark.impl.aggregator.swingui.BenchmarkAggregatorFrame;
import ai.timefold.solver.benchmark.impl.result.PlannerBenchmarkResult;
import com.patrick.timetableappbackend.model.Timetable;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.File;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;

@Service
@RequiredArgsConstructor
@Slf4j
public class BenchmarkService {

    private final TimetableService timetableService;

    public String runBenchmarkOnDatabase() {
//        PlannerBenchmarkConfig benchmarkConfig = PlannerBenchmarkConfig.createFromXmlResource("benchmarkConfig.xml");
        //         PlannerBenchmarkResult benchmarkResult = new PlannerBenchmarkResult();
        Timetable timetableSolution = timetableService.getTimetableData();
        timetableSolution.getLessons().forEach(lesson -> lesson.setTimetable(timetableSolution));
        PlannerBenchmarkFactory benchmarkFactory = PlannerBenchmarkFactory.createFromXmlResource("benchmarkConfig.xml");
        PlannerBenchmark plannerBenchmark = benchmarkFactory.buildPlannerBenchmark(timetableSolution);
        File file = plannerBenchmark.benchmark();

        // Find the actual benchmark result directory (with timestamp)
        File actualBenchmarkDir = findMostRecentBenchmarkDirectory(file);
        String directoryName = actualBenchmarkDir.getName();

        return "http://localhost:8200/api/v1/benchmarks/report/" + directoryName + "/index.html";
    }

    public String runBenchmarkOnImported(Timetable solution) {
        solution.getLessons().forEach(lesson -> lesson.setTimetable(solution));
        PlannerBenchmarkFactory benchmarkFactory = PlannerBenchmarkFactory.createFromXmlResource("benchmarkConfig.xml");
        PlannerBenchmark plannerBenchmark = benchmarkFactory.buildPlannerBenchmark(solution);
        File file = plannerBenchmark.benchmark();
        
        // Find the actual benchmark result directory (with timestamp)
        File actualBenchmarkDir = findMostRecentBenchmarkDirectory(file);
        String directoryName = actualBenchmarkDir.getName();

        return "http://localhost:8200/api/v1/benchmarks/report/" + directoryName + "/index.html";

    }

    //TODO: Implement aggregation functionality properly
    public void aggregateBenchmarks() {
        BenchmarkAggregatorFrame.createAndDisplayFromXmlResource("benchmarkConfig.xml");
    }

    private File findMostRecentBenchmarkDirectory(File parentDir) {
        File[] directories = parentDir.listFiles(File::isDirectory);
        if (directories == null || directories.length == 0) {
            throw new RuntimeException("No benchmark directories found in " + parentDir.getAbsolutePath());
        }

        // Sort directories by last modified time (most recent first)
        Arrays.sort(directories, (a, b) -> Long.compare(b.lastModified(), a.lastModified()));

        return directories[0]; // Return the most recent directory
    }
}
