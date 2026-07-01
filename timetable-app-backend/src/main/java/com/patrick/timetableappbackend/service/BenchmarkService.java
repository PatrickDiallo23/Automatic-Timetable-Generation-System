package com.patrick.timetableappbackend.service;

import ai.timefold.solver.benchmark.aggregator.BenchmarkAggregator;
import ai.timefold.solver.benchmark.aggregator.swingui.BenchmarkAggregatorFrame;
import ai.timefold.solver.benchmark.api.PlannerBenchmark;
import ai.timefold.solver.benchmark.api.PlannerBenchmarkFactory;
import ai.timefold.solver.benchmark.config.PlannerBenchmarkConfig;

import com.patrick.timetableappbackend.model.Timetable;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.File;
import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class BenchmarkService {

    private final TimetableService timetableService;

    /**
     * Runs a benchmark on the timetable data fetched from the database.
     *
     * @return URL to access the benchmark report
     */
    public String runBenchmarkOnDatabase() {
//        PlannerBenchmarkConfig benchmarkConfig = PlannerBenchmarkConfig.createFromXmlResource("benchmarkConfig.xml");
        //         PlannerBenchmarkResult benchmarkResult = new PlannerBenchmarkResult();
        log.info("Starting benchmark on database timetable data...");
        Timetable timetableSolution = timetableService.getTimetableData();
        timetableSolution.getLessons().forEach(lesson -> lesson.setTimetable(timetableSolution));
        PlannerBenchmarkFactory benchmarkFactory = PlannerBenchmarkFactory.createFromXmlResource("benchmarkConfig.xml");
        log.info("PlannerBenchmarkFactory created from XML resource.");
        PlannerBenchmark plannerBenchmark = benchmarkFactory.buildPlannerBenchmark(timetableSolution);
        File file = plannerBenchmark.benchmark();

        // Find the actual benchmark result directory (with timestamp)
        File actualBenchmarkDir = findMostRecentBenchmarkDirectory(file);
        log.info("Benchmark completed. Results stored in directory: {}", actualBenchmarkDir.getAbsolutePath());
//        String indexPath = actualBenchmarkDir.getAbsolutePath() + "/index.html";
        String directoryName = actualBenchmarkDir.getName();

//        return "http://localhost:8200/api/v1/benchmarks/report?path=" + URLEncoder.encode(indexPath, StandardCharsets.UTF_8);
        return "http://localhost:8200/api/v1/benchmarks/report/" + directoryName + "/index.html";
    }

    /**
     * Runs a benchmark on the provided imported timetable data.
     *
     * @param solution The imported timetable solution to benchmark
     * @return URL to access the benchmark report
     */
    public String runBenchmarkOnImported(Timetable solution) {
        log.info("Starting benchmark on imported timetable data...");
        solution.getLessons().forEach(lesson -> lesson.setTimetable(solution));
        PlannerBenchmarkFactory benchmarkFactory = PlannerBenchmarkFactory.createFromXmlResource("benchmarkConfig.xml");
        log.info("PlannerBenchmarkFactory created from XML resource.");
        PlannerBenchmark plannerBenchmark = benchmarkFactory.buildPlannerBenchmark(solution);
        File file = plannerBenchmark.benchmark();
        
        // Find the actual benchmark result directory (with timestamp)
        File actualBenchmarkDir = findMostRecentBenchmarkDirectory(file);
        log.info("Benchmark completed. Results stored in directory: {}", actualBenchmarkDir.getAbsolutePath());
        String directoryName = actualBenchmarkDir.getName();

//        return actualBenchmarkDir.getAbsolutePath() + "/index.html";
        return "http://localhost:8200/api/v1/benchmarks/report/" + directoryName + "/index.html";
    }

    public void aggregateBenchmarks() {
        BenchmarkAggregatorFrame.createAndDisplayFromXmlResource("benchmarkConfig.xml");
    }

    /**
     * Aggregates all benchmark results from the benchmark directory into a single comprehensive report.
     *
     * @return File pointing to the generated HTML overview report
     */
    public File aggregateAllBenchmarks() {
        PlannerBenchmarkConfig benchmarkConfig = PlannerBenchmarkConfig.createFromXmlResource("benchmarkConfig.xml");
        log.info("Starting benchmark aggregation for all results...");
        BenchmarkAggregator aggregator = new BenchmarkAggregator();
        File htmlOverviewFile = aggregator.aggregateBenchmarks(benchmarkConfig);
        log.info("Benchmark aggregation completed. Report available at: {}", htmlOverviewFile.getAbsolutePath());
        return htmlOverviewFile;
    }

    /**
     * Aggregates specific benchmark results by their directory names.
     *
     * @param benchmarkDirectoryNames List of benchmark directory names to include in aggregation
     * @return File pointing to the generated HTML overview report
     */
    public File aggregateSelectedBenchmarks(List<String> benchmarkDirectoryNames) {
        PlannerBenchmarkConfig benchmarkConfig = PlannerBenchmarkConfig.createFromXmlResource("benchmarkConfig.xml");
        log.info("Starting selective benchmark aggregation for directories: {}", benchmarkDirectoryNames);
        BenchmarkAggregator aggregator = new BenchmarkAggregator();
        File htmlOverviewFile = aggregator.aggregateSelectedBenchmarks(benchmarkConfig, benchmarkDirectoryNames);
        log.info("Selective benchmark aggregation completed. Report available at: {}", htmlOverviewFile.getAbsolutePath());
        return htmlOverviewFile;
    }

    /**
     * Lists available benchmark directories.
     *
     * @return List of benchmark directory names
     */
    public List<String> getAvailableBenchmarkDirectories() {
        PlannerBenchmarkConfig benchmarkConfig = PlannerBenchmarkConfig.createFromXmlResource("benchmarkConfig.xml");
        BenchmarkAggregator aggregator = new BenchmarkAggregator();
        return aggregator.getAvailableBenchmarkDirectories(benchmarkConfig);
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
