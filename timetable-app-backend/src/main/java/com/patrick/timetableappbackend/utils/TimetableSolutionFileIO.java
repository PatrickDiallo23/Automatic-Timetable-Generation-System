package com.patrick.timetableappbackend.utils;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.json.JsonMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.patrick.timetableappbackend.model.Timetable;

import ai.timefold.solver.jackson.impl.domain.solution.JacksonSolutionFileIO;

public class TimetableSolutionFileIO extends JacksonSolutionFileIO<Timetable> {
    public TimetableSolutionFileIO(Class<Timetable> clazz) {
        super(clazz);
    }
}
