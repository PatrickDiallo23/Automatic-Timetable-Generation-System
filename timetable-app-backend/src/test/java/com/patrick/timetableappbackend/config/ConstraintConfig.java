package com.patrick.timetableappbackend.config;

import ai.timefold.solver.test.api.score.stream.ConstraintVerifier;
import com.patrick.timetableappbackend.model.Lesson;
import com.patrick.timetableappbackend.model.Timetable;
import com.patrick.timetableappbackend.solver.TimetableConstraintProvider;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;

@TestConfiguration
public class ConstraintConfig {

  @Bean
  public ConstraintVerifier<TimetableConstraintProvider, Timetable> buildConstraintVerifier() {
    return ConstraintVerifier.build(
        new TimetableConstraintProvider(), Timetable.class, Lesson.class);
  }
}
