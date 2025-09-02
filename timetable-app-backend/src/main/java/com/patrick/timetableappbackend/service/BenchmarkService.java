package com.patrick.timetableappbackend.service;

import ai.timefold.solver.benchmark.api.PlannerBenchmark;
import ai.timefold.solver.benchmark.api.PlannerBenchmarkFactory;
import ai.timefold.solver.benchmark.config.PlannerBenchmarkConfig;
import ai.timefold.solver.benchmark.impl.aggregator.BenchmarkAggregator;
import ai.timefold.solver.benchmark.impl.aggregator.swingui.BenchmarkAggregatorFrame;
import ai.timefold.solver.benchmark.impl.result.BenchmarkResultIO;
import ai.timefold.solver.benchmark.impl.result.PlannerBenchmarkResult;
import ai.timefold.solver.benchmark.impl.result.SingleBenchmarkResult;
import ai.timefold.solver.benchmark.impl.result.SolverBenchmarkResult;
import com.patrick.timetableappbackend.model.Timetable;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.File;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class BenchmarkService {

    private final TimetableService timetableService;
    private final BenchmarkResultIO benchmarkResultIO = new BenchmarkResultIO();

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
     * @throws IllegalArgumentException if benchmark directory doesn't exist or no benchmarks found
     */
    public File aggregateAllBenchmarks() {
        PlannerBenchmarkConfig benchmarkConfig = PlannerBenchmarkConfig.createFromXmlResource("benchmarkConfig.xml");
        String benchmarkDirectoryPath = String.valueOf(benchmarkConfig.getBenchmarkDirectory());
        File benchmarkDirectory = new File(benchmarkDirectoryPath);

        if (!benchmarkDirectory.exists() || !benchmarkDirectory.isDirectory()) {
            throw new IllegalArgumentException("Benchmark directory does not exist: " + benchmarkDirectoryPath);
        }

        log.info("Starting benchmark aggregation from directory: {}", benchmarkDirectory.getAbsolutePath());

        // Read all existing benchmark results
        List<PlannerBenchmarkResult> plannerBenchmarkResults = benchmarkResultIO.readPlannerBenchmarkResultList(benchmarkDirectory);

        if (plannerBenchmarkResults.isEmpty()) {
            throw new IllegalArgumentException("No benchmark results found in directory: " + benchmarkDirectoryPath);
        }

        log.info("Found {} planner benchmark results", plannerBenchmarkResults.size());

        // Collect all single benchmark results from all planner benchmark results
        List<SingleBenchmarkResult> allSingleBenchmarkResults = new ArrayList<>();
        Map<SolverBenchmarkResult, String> solverBenchmarkResultNameMap = new HashMap<>();

        for (PlannerBenchmarkResult plannerResult : plannerBenchmarkResults) {
            for (SolverBenchmarkResult solverResult : plannerResult.getSolverBenchmarkResultList()) {
                // Add all single benchmark results from this solver
                allSingleBenchmarkResults.addAll(solverResult.getSingleBenchmarkResultList());

                // Preserve original solver names for the aggregation
                solverBenchmarkResultNameMap.put(solverResult, solverResult.getName());
            }
        }

        log.info("Collected {} single benchmark results for aggregation", allSingleBenchmarkResults.size());

        // Create and configure the benchmark aggregator
        BenchmarkAggregator aggregator = new BenchmarkAggregator();
        aggregator.setBenchmarkDirectory(benchmarkDirectory);
        aggregator.setBenchmarkReportConfig(benchmarkConfig.getBenchmarkReportConfig());

        // Perform the aggregation
        File htmlOverviewFile = aggregator.aggregate(allSingleBenchmarkResults, solverBenchmarkResultNameMap);

        log.info("Benchmark aggregation completed successfully. Report available at: {}",
                htmlOverviewFile.getAbsolutePath());

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
        String benchmarkDirectoryPath = String.valueOf(benchmarkConfig.getBenchmarkDirectory());
        File benchmarkDirectory = new File(benchmarkDirectoryPath);

        if (!benchmarkDirectory.exists() || !benchmarkDirectory.isDirectory()) {
            throw new IllegalArgumentException("Benchmark directory does not exist: " + benchmarkDirectoryPath);
        }

        log.info("Starting selective benchmark aggregation for directories: {}", benchmarkDirectoryNames);

        // Read all benchmark results first, then filter
        List<PlannerBenchmarkResult> allPlannerResults = benchmarkResultIO.readPlannerBenchmarkResultList(benchmarkDirectory);

        List<SingleBenchmarkResult> selectedSingleBenchmarkResults = new ArrayList<>();
        Map<SolverBenchmarkResult, String> solverBenchmarkResultNameMap = new HashMap<>();

        // Filter results based on selected directory names
        for (PlannerBenchmarkResult plannerResult : allPlannerResults) {
            String benchmarkDirectoryName = plannerResult.getBenchmarkReportDirectory().getName();

            if (benchmarkDirectoryNames.contains(benchmarkDirectoryName)) {
                log.info("Including benchmark results from directory: {}", benchmarkDirectoryName);

                for (SolverBenchmarkResult solverResult : plannerResult.getSolverBenchmarkResultList()) {
                    selectedSingleBenchmarkResults.addAll(solverResult.getSingleBenchmarkResultList());
                    solverBenchmarkResultNameMap.put(solverResult, solverResult.getName());
                }
            }
        }

        if (selectedSingleBenchmarkResults.isEmpty()) {
            throw new IllegalArgumentException("No valid benchmark results found for selected directories: " + benchmarkDirectoryNames);
        }

        log.info("Collected {} single benchmark results from selected directories", selectedSingleBenchmarkResults.size());

        BenchmarkAggregator aggregator = new BenchmarkAggregator();
        aggregator.setBenchmarkDirectory(benchmarkDirectory);
        aggregator.setBenchmarkReportConfig(benchmarkConfig.getBenchmarkReportConfig());

        File htmlOverviewFile = aggregator.aggregate(selectedSingleBenchmarkResults, solverBenchmarkResultNameMap);

        log.info("Selective benchmark aggregation completed. Report available at: {}",
                htmlOverviewFile.getAbsolutePath());

        return htmlOverviewFile;
    }

    /**
     * Lists available benchmark directories.
     *
     * @return List of benchmark directory names
     */
    public List<String> getAvailableBenchmarkDirectories() {
        PlannerBenchmarkConfig benchmarkConfig = PlannerBenchmarkConfig.createFromXmlResource("benchmarkConfig.xml");
        String benchmarkDirectoryPath = String.valueOf(benchmarkConfig.getBenchmarkDirectory());
        File benchmarkDirectory = new File(benchmarkDirectoryPath);

        List<String> directories = new ArrayList<>();

        if (!benchmarkDirectory.exists() || !benchmarkDirectory.isDirectory()) {
            return directories;
        }

        File[] subdirs = benchmarkDirectory.listFiles(File::isDirectory);
        if (subdirs != null) {
            for (File subdir : subdirs) {
                // Only include directories that have a benchmark result file
                File resultFile = new File(subdir, "plannerBenchmarkResult.xml");
                if (resultFile.exists()) {
                    directories.add(subdir.getName());
                }
            }
        }

        return directories;
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
