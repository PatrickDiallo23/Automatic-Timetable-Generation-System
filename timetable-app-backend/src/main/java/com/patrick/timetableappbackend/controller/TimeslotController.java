package com.patrick.timetableappbackend.controller;

import com.patrick.timetableappbackend.dto.TimeslotRequest;
import com.patrick.timetableappbackend.model.Timeslot;
import com.patrick.timetableappbackend.service.TimeslotService;
import java.time.DayOfWeek;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/timeslots")
@RequiredArgsConstructor
@Slf4j
public class TimeslotController {

  private final TimeslotService timeslotService;

  @GetMapping
  public ResponseEntity<List<Timeslot>> getAllTimeslots() {
    List<Timeslot> timeslots = timeslotService.getAllTimeslots();
    return new ResponseEntity<>(timeslots, HttpStatus.OK);
  }

  @GetMapping("/{id}")
  public ResponseEntity<Timeslot> getTimeslotById(@PathVariable Long id) {
    return timeslotService
        .getTimeslotById(id)
        .map(timeslot -> new ResponseEntity<>(timeslot, HttpStatus.OK))
        .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
  }

  @GetMapping("/count")
  public ResponseEntity<Long> getTimeslotCount() {
    long timeslotCount = timeslotService.getTimeslotCount();
    return new ResponseEntity<>(timeslotCount, HttpStatus.OK);
  }

  @PostMapping
  public ResponseEntity<Timeslot> createTimeslot(@RequestBody TimeslotRequest timeslot) {
    DayOfWeek dayOfWeek = DayOfWeek.of(timeslot.getDayOfWeek());
    Timeslot requestTimeslot =
        Timeslot.builder()
            .dayOfWeek(dayOfWeek)
            .startTime(timeslot.getStartTime())
            .endTime(timeslot.getEndTime())
            .build();
    Timeslot createdTimeslot = timeslotService.createTimeslot(requestTimeslot);
    return new ResponseEntity<>(createdTimeslot, HttpStatus.CREATED);
  }

  @PutMapping("/{id}")
  public ResponseEntity<Timeslot> updateTimeslot(
      @PathVariable Long id, @RequestBody Timeslot updatedTimeslot) {
    try {
      Timeslot updated = timeslotService.updateTimeslot(id, updatedTimeslot);
      return new ResponseEntity<>(updated, HttpStatus.OK);
    } catch (RuntimeException e) {
      return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deleteTimeslot(@PathVariable Long id) {
    timeslotService.deleteTimeslot(id);
    return new ResponseEntity<>(HttpStatus.NO_CONTENT);
  }
}
