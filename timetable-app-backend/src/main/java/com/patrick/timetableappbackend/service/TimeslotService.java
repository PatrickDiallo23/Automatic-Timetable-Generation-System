package com.patrick.timetableappbackend.service;

import com.patrick.timetableappbackend.model.Timeslot;
import com.patrick.timetableappbackend.repository.TimeslotRepo;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class TimeslotService {

  private final TimeslotRepo timeslotRepo;

  public List<Timeslot> getAllTimeslots() {
    return timeslotRepo.findAllByOrderByIdAsc();
  }

  public Optional<Timeslot> getTimeslotById(Long id) {
    return timeslotRepo.findById(id);
  }

  public long getTimeslotCount() {
    return timeslotRepo.count();
  }

  public Timeslot createTimeslot(Timeslot timeslot) {
    return this.timeslotRepo.save(timeslot);
  }

  public Timeslot updateTimeslot(Long id, Timeslot updatedTimeslot) {
    if (timeslotRepo.existsById(id)) {
      updatedTimeslot =
          Timeslot.builder()
              .id(updatedTimeslot.getId())
              .dayOfWeek(updatedTimeslot.getDayOfWeek())
              .startTime(updatedTimeslot.getStartTime())
              .endTime(updatedTimeslot.getEndTime())
              .build();
      return timeslotRepo.save(updatedTimeslot);
    } else {
      throw new RuntimeException("Timeslot not found with id: " + id);
    }
  }

  public void deleteTimeslot(Long id) {
    timeslotRepo.deleteById(id);
  }
}
