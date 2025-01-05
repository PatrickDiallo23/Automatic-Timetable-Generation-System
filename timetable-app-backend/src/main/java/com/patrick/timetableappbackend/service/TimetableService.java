package com.patrick.timetableappbackend.service;

import ai.timefold.solver.core.api.score.analysis.ScoreAnalysis;
import ai.timefold.solver.core.api.score.buildin.hardmediumsoft.HardMediumSoftScore;
import ai.timefold.solver.core.api.solver.*;
import ai.timefold.solver.core.config.solver.termination.TerminationConfig;
import com.patrick.timetableappbackend.exception.TimetableSolverException;
import com.patrick.timetableappbackend.model.*;
import com.patrick.timetableappbackend.repository.ConstraintRepo;
import com.patrick.timetableappbackend.repository.LessonRepo;
import com.patrick.timetableappbackend.repository.RoomRepo;
import com.patrick.timetableappbackend.repository.TimeslotRepo;
import com.patrick.timetableappbackend.solver.TimetableConstraintConfiguration;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class TimetableService {
    private static final Logger LOGGER = LoggerFactory.getLogger(TimetableService.class);

    private final RoomRepo roomRepo;
    private final TimeslotRepo timeslotRepo;
    private final LessonRepo lessonRepo;
    private final ConstraintRepo constraintRepo;
    private final SolverManager<Timetable, String> solverManager;
    private final SolutionManager<Timetable, HardMediumSoftScore> solutionManager;
    @Value("${timefold.solver.termination.spent-limit}")
    private String duration;

    // TODO: Without any "time to live", the map may eventually grow out of memory.
    private final ConcurrentMap<String, Job> jobIdToJob = new ConcurrentHashMap<>();

    public Collection<String> getJobIds() {
        return jobIdToJob.keySet();
    }

    public Timetable getTimetableData() {

        Long problemDuration = Long.parseLong(this.duration.substring(0, this.duration.length() - 1));

        final List<Timeslot> timeslots = timeslotRepo.findAll();
        final List<Room> rooms = roomRepo.findAll();
        final List<ConstraintModel> constraintModels = constraintRepo.findAll();
        final TimetableConstraintConfiguration timetableConstraintConfiguration = new TimetableConstraintConfiguration(constraintModels);
        final List<Lesson> lessons = lessonRepo.findAll();

        return new Timetable(timeslots, rooms, lessons, timetableConstraintConfiguration, problemDuration);

    }

    // How to integrate with Spring JPA to persist the Timetable solution
    // How to get the best solution
    public String solve(Timetable problem) {
        problem.getLessons().forEach(lesson -> lesson.setTimetable(problem));
        final ConcurrentMap<String, Timetable> timetableSolution = new ConcurrentHashMap<>();
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

    private record Job(Timetable timetable, Throwable exception) {

        static Job ofTimetable(Timetable timetable) {
            return new Job(timetable, null);
        }

        static Job ofException(Throwable error) {
            return new Job(null, error);
        }
    }
}
