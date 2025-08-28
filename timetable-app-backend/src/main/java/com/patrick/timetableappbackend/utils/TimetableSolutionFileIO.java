package com.patrick.timetableappbackend.utils;

import ai.timefold.solver.jackson.impl.domain.solution.JacksonSolutionFileIO;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.patrick.timetableappbackend.model.Timetable;

public class TimetableSolutionFileIO extends JacksonSolutionFileIO<Timetable> {
    public TimetableSolutionFileIO(Class<Timetable> clazz) {
        super(clazz);
    }

    public TimetableSolutionFileIO(Class<Timetable> clazz, ObjectMapper mapper) {
        super(clazz, mapper.registerModule(new JavaTimeModule())
                .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS));
    }
}
