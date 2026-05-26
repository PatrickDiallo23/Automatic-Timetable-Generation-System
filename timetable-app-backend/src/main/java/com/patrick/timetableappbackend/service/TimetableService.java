package com.patrick.timetableappbackend.service;


import ai.timefold.solver.core.api.score.analysis.ScoreAnalysis;
import ai.timefold.solver.core.api.score.buildin.hardmediumsoft.HardMediumSoftScore;
import ai.timefold.solver.core.api.solver.ScoreAnalysisFetchPolicy;
import ai.timefold.solver.core.api.solver.SolutionManager;
import ai.timefold.solver.core.api.solver.SolutionUpdatePolicy;
import ai.timefold.solver.core.api.solver.SolverManager;
import ai.timefold.solver.core.api.solver.SolverStatus;
import com.patrick.timetableappbackend.exception.TimetableSolverException;
import com.patrick.timetableappbackend.model.ConstraintModel;
import com.patrick.timetableappbackend.model.Lesson;
import com.patrick.timetableappbackend.model.RestrictionRule;
import com.patrick.timetableappbackend.model.Room;
import com.patrick.timetableappbackend.model.Timeslot;
import com.patrick.timetableappbackend.model.Timetable;
import com.patrick.timetableappbackend.repository.ConstraintRepo;
import com.patrick.timetableappbackend.repository.LessonRepo;
import com.patrick.timetableappbackend.repository.RestrictionRuleRepo;
import com.patrick.timetableappbackend.repository.RoomRepo;
import com.patrick.timetableappbackend.repository.TimeslotRepo;
import com.patrick.timetableappbackend.solver.TimetableConstraintConfiguration;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TimetableService {
    private static final Logger LOGGER = LoggerFactory.getLogger(TimetableService.class);

    private final RoomRepo roomRepo;
    private final TimeslotRepo timeslotRepo;
    private final LessonRepo lessonRepo;
    private final ConstraintRepo constraintRepo;
    private final RestrictionRuleRepo restrictionRuleRepo;
    private final SolverManager<Timetable, String> solverManager;
    private final SolutionManager<Timetable, HardMediumSoftScore> solutionManager;
    @Value("${timefold.solver.termination.spent-limit}")
    private String duration;

    @Value("${timetableApp.job.ttl-hours:8}")
    private long jobTtlHours;

    private final ConcurrentMap<String, Job> jobIdToJob = new ConcurrentHashMap<>();

    public Collection<String> getJobIds() {
        return jobIdToJob.keySet();
    }

    @Transactional(readOnly = true)
    public Timetable getTimetableData() {

        Long problemDuration = Long.parseLong(this.duration.substring(0, this.duration.length() - 1));

        final List<Timeslot> timeslots = timeslotRepo.findAll();
        final List<Room> rooms = roomRepo.findAll();
        final List<ConstraintModel> constraintModels = constraintRepo.findAll();
        final TimetableConstraintConfiguration timetableConstraintConfiguration = new TimetableConstraintConfiguration(constraintModels);
        final List<Lesson> lessons = lessonRepo.findAll();
        final List<RestrictionRule> activeRules = restrictionRuleRepo.findByActiveTrue();

        Timetable timetable = new Timetable(timeslots, rooms, lessons, timetableConstraintConfiguration, problemDuration);
        timetable.setRestrictionRules(activeRules);
        wireRulesToLessons(timetable);
        return timetable;

    }

    // How to integrate with Spring JPA to persist the Timetable solution
    // How to get the best solution
    public String solve(Timetable problem) {
        problem.getLessons().forEach(lesson -> lesson.setTimetable(problem));
        wireRulesToLessons(problem);

        String jobId = UUID.randomUUID().toString();
        jobIdToJob.put(jobId, Job.ofTimetable(problem));
        solverManager.solveBuilder()
                .withProblemId(jobId)
                //todo: to see how to implement this termination Config properly on a new version of Timefold
                //no need to add duration because we take it from application.properties
//                .withConfigOverride(new SolverConfigOverride<Timetable>()
//                        .withTerminationConfig(new TerminationConfig().withMinutesSpentLimit(problem.getDuration())))
                .withProblemFinder(jobId_ -> jobIdToJob.get(jobId).timetable)
                .withBestSolutionConsumer(solution -> jobIdToJob.put(jobId, Job.ofTimetable(solution)))
                //.withFinalBestSolutionConsumer(solution -> jobIdToJob/timetableSolution.put(jobId, solution))
                .withExceptionHandler((jobId_, exception) -> {
                    jobIdToJob.put(jobId, Job.ofException(exception));
                    LOGGER.error("Failed solving jobId ({}).", jobId, exception);
                })
                .run();
        return jobId;
    }

    public ScoreAnalysis<HardMediumSoftScore> analyze(Timetable problem, ScoreAnalysisFetchPolicy fetchPolicy) {
        return fetchPolicy == null ? solutionManager.analyze(problem) : solutionManager.analyze(problem, fetchPolicy);
    }

    public HardMediumSoftScore update(Timetable problem, SolutionUpdatePolicy fetchPolicy) {
        return fetchPolicy == null ? solutionManager.update(problem) : solutionManager.update(problem, fetchPolicy);
    }

    public Timetable getTimetable(String jobId) {
        Timetable timetable = getTimetableAndCheckForExceptions(jobId);
        SolverStatus solverStatus = solverManager.getSolverStatus(jobId);
        timetable.setSolverStatus(solverStatus);
        return timetable;
    }

    public Timetable getStatus(String jobId) {
        Timetable timetable = getTimetableAndCheckForExceptions(jobId);
        SolverStatus solverStatus = solverManager.getSolverStatus(jobId);
        return new Timetable(timetable.getScore(), solverStatus);
    }

    public Timetable terminateSolving(String jobId) {
        // TODO: Replace with .terminateEarlyAndWait(... [, timeout]); see https://github.com/TimefoldAI/timefold-solver/issues/77
        solverManager.terminateEarly(jobId);
        return getTimetable(jobId);
    }

    private Timetable getTimetableAndCheckForExceptions(String jobId) {
        Job job = jobIdToJob.get(jobId);
        if (job == null) {
            throw new TimetableSolverException(jobId, HttpStatus.NOT_FOUND, "No timetable found.");
        }
        if (job.exception != null) {
            throw new TimetableSolverException(jobId, job.exception);
        }
        return job.timetable;
    }

    private record Job(Timetable timetable, Throwable exception, Instant createdAt) {

        static Job ofTimetable(Timetable timetable) {
            return new Job(timetable, null, Instant.now());
        }

        static Job ofException(Throwable error) {
            return new Job(null, error, Instant.now());
        }
    }

    @Scheduled(fixedRateString = "${timetableApp.job.cleanup-interval-ms:1800000}")
    public void evictExpiredJobs() {
        Instant cutoff = Instant.now().minus(jobTtlHours, ChronoUnit.HOURS);
        int evictedCount = 0;

        for (Map.Entry<String, Job> entry : jobIdToJob.entrySet()) {
            String jobId = entry.getKey();
            Job job = entry.getValue();

            if (job.createdAt().isBefore(cutoff)) {
                SolverStatus status = solverManager.getSolverStatus(jobId);
                if (status == SolverStatus.NOT_SOLVING) {
                    jobIdToJob.remove(jobId);
                    evictedCount++;
                } else {
                    LOGGER.debug("Skipping eviction of job ({}) — still active with status: {}", jobId, status);
                }
            }
        }

        if (evictedCount > 0) {
            LOGGER.info("Evicted {} expired job entries. Remaining: {}", evictedCount, jobIdToJob.size());
        }
    }

    private void wireRulesToLessons(Timetable timetable) {
        List<RestrictionRule> allRules = timetable.getRestrictionRules();
        if (allRules == null || allRules.isEmpty()) {
            return;
        }
        Map<Long, RestrictionRule> ruleMap = allRules.stream()
                .collect(Collectors.toMap(RestrictionRule::getId, Function.identity()));
        for (Lesson lesson : timetable.getLessons()) {
            if (lesson.getAppliedRuleIds() != null && !lesson.getAppliedRuleIds().isEmpty()) {
                List<RestrictionRule> resolved = lesson.getAppliedRuleIds().stream()
                        .map(ruleMap::get)
                        .filter(java.util.Objects::nonNull)
                        .toList();
                lesson.setAppliedRules(resolved);
            }
        }
    }
}
