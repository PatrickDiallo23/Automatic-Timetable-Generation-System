package com.patrick.timetableappbackend.service;

import com.patrick.timetableappbackend.model.Timeslot;
import com.patrick.timetableappbackend.repository.TimeslotRepo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class TimeslotService {

    private final TimeslotRepo timeslotRepo;

    @Transactional(readOnly = true)
    public List<Timeslot> getAllTimeslots() {
        return timeslotRepo.findAllByOrderByIdAsc();
    }

    @Transactional(readOnly = true)
    public Optional<Timeslot> getTimeslotById(Long id) {
        return timeslotRepo.findById(id);
    }

    public long getTimeslotCount() {
        return timeslotRepo.count();
    }

    @Transactional
    public Timeslot createTimeslot(Timeslot timeslot) {
        return this.timeslotRepo.save(timeslot);
    }

    @Transactional
    public Timeslot updateTimeslot(Long id, Timeslot updatedTimeslot) {
        return timeslotRepo.findById(id)
                .map(existingTimeslot -> {
                    existingTimeslot.setDayOfWeek(updatedTimeslot.getDayOfWeek());
                    existingTimeslot.setStartTime(updatedTimeslot.getStartTime());
                    existingTimeslot.setEndTime(updatedTimeslot.getEndTime());
                    return timeslotRepo.save(existingTimeslot);
                })
                .orElseThrow(() -> new RuntimeException("No timeslot found with id " + id));
    }

    @Transactional
    public void deleteTimeslot(Long id) {
        timeslotRepo.deleteById(id);
    }

}
