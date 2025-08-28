package com.patrick.timetableappbackend.controller;

import com.patrick.timetableappbackend.dto.BenchmarkRequest;
import com.patrick.timetableappbackend.service.BenchmarkService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.time.Duration;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/benchmarks")
@Tag(name = "Benchmark Management", description = "Operations related to benchmarking the timetable solution")
@RequiredArgsConstructor
public class BenchmarkController {

    private final BenchmarkService benchmarkService;

    @Operation(
            summary = "Serve Benchmark Report",
            description = "Serves the generated benchmark report (index.html or related file) for a given benchmark run."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Benchmark report successfully retrieved",
                    content = @Content(
                            mediaType = "text/html",
                            schema = @Schema(type = "string", format = "binary")
                    )
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Benchmark report not found",
                    content = @Content
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Error while retrieving benchmark report",
                    content = @Content
            )
    })
    @GetMapping("/report/**")
    public ResponseEntity<Resource> serveBenchmarkFile(
            @Parameter(description = "HttpServletRequest to extract the file path")
            HttpServletRequest request) {
        try {
            // Extract the file path after /report/
            String path = request.getRequestURI().substring("/api/v1/benchmarks/report/".length());

            // Build the full file path
            File file = new File("local/data/" + path);

            // Security check - ensure file is within benchmark directory
            String canonicalPath = file.getCanonicalPath();
            String benchmarkBasePath = new File("local/data/").getCanonicalPath();
            if (!canonicalPath.startsWith(benchmarkBasePath)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            if (!file.exists() || !file.canRead()) {
                return ResponseEntity.notFound().build();
            }

            Resource resource = new FileSystemResource(file);
            String contentType = determineContentType(file);

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .cacheControl(CacheControl.maxAge(Duration.ofHours(2)))
                    .body(resource);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @Operation(summary = "Run Benchmark", description = "Run a benchmark on the timetable solution, either from an imported timetable or from the database.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Benchmark run successfully",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = Map.class))),
            @ApiResponse(responseCode = "400", description = "Bad request"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @PostMapping("/run")
    @PreAuthorize("hasAuthority('ADMIN')")
    @SecurityRequirement(name = "Bearer Authentication")
    public ResponseEntity<Map<String, String>> runBenchmark(
            @Parameter(description = "Benchmark request containing the source of the timetable data and the timetable itself")
            @RequestBody BenchmarkRequest request) {
        try {
            String reportUrl;
            if ("imported".equals(request.getSource())) {
                reportUrl = benchmarkService.runBenchmarkOnImported(request.getTimetable());
            } else {
                reportUrl = benchmarkService.runBenchmarkOnDatabase();
            }
            return ResponseEntity.ok(Map.of("reportUrl", reportUrl));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @Operation(summary = "Aggregate Benchmarks", description = "Aggregate the results of multiple benchmarks into a single report.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Benchmarks aggregated successfully"),
            @ApiResponse(responseCode = "400", description = "Bad request"),
            @ApiResponse(responseCode = "401", description = "Unauthorized access"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @PostMapping("/aggregate")
    @PreAuthorize("hasAuthority('ADMIN')")
    @SecurityRequirement(name = "Bearer Authentication")
    public ResponseEntity<Void> aggregateBenchmark() {
        try {
            benchmarkService.aggregateBenchmarks();
            return new ResponseEntity<>(HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private String determineContentType(File file) {
        String fileName = file.getName().toLowerCase();
        if (fileName.endsWith(".html")) return "text/html";
        if (fileName.endsWith(".css")) return "text/css";
        if (fileName.endsWith(".js")) return "application/javascript";
        if (fileName.endsWith(".csv")) return "text/csv";
        if (fileName.endsWith(".png")) return "image/png";
        if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) return "image/jpeg";
        if (fileName.endsWith(".svg")) return "image/svg+xml";
        return "application/octet-stream";
    }
}
