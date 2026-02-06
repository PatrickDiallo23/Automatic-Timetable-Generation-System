package com.patrick.timetableappbackend.service;

import com.patrick.timetableappbackend.model.Lesson;
import com.patrick.timetableappbackend.repository.LessonRepo;
import com.patrick.timetableappbackend.repository.RoomRepo;
import com.patrick.timetableappbackend.repository.StudentGroupRepo;
import com.patrick.timetableappbackend.repository.TeacherRepo;
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
public class LessonService {

    private final LessonRepo lessonRepo;
    private final TeacherRepo teacherRepo;
    private final StudentGroupRepo studentGroupRepo;
    private final TimeslotRepo timeslotRepo;
    private final RoomRepo roomRepo;

    @Transactional(readOnly = true)
    public List<Lesson> getAllLessons() {
        return lessonRepo.findAllLessonsOrderedById();
    }

    @Transactional(readOnly = true)
    public Optional<Lesson> getLessonById(Long id) {
        return lessonRepo.findLessonsById(id);
    }

    public Long getLessonCount() {
        return lessonRepo.count();
    }

    @Transactional
    public Lesson createLesson(Lesson lesson) {
        return lessonRepo.save(lesson);
    }

    @Transactional
    public Lesson updateLesson(Long id, Lesson updatedLesson) {
        return lessonRepo.findById(id)
                .map(existingLesson -> {
                    existingLesson.setSubject(updatedLesson.getSubject());
                    if (updatedLesson.getTeacher() != null) {
                        existingLesson.setTeacher(teacherRepo.findById(updatedLesson.getTeacher().getId())
                                .orElseThrow(() -> new RuntimeException("No teacher found with that id")));
                    }
                    if (updatedLesson.getStudentGroup() != null) {
                        existingLesson.setStudentGroup(studentGroupRepo.findById(updatedLesson.getStudentGroup().getId())
                                .orElseThrow(() -> new RuntimeException("No student group found with that id")));
                    }
                    existingLesson.setLessonType(updatedLesson.getLessonType());
                    existingLesson.setYear(updatedLesson.getYear());
                    existingLesson.setDuration(updatedLesson.getDuration());
                    existingLesson.setPinned(updatedLesson.isPinned());
                    
                    // Update timeslot and room if provided (for pinning)
                    if (updatedLesson.getTimeslot() != null) {
                        existingLesson.setTimeslot(timeslotRepo.findById(updatedLesson.getTimeslot().getId())
                                .orElse(null));
                    }
                    if (updatedLesson.getRoom() != null) {
                        existingLesson.setRoom(roomRepo.findById(updatedLesson.getRoom().getId())
                                .orElse(null));
                    }
                    
                    return lessonRepo.save(existingLesson);
                })
                .orElseThrow(() -> new RuntimeException("No lesson found with id " + id));
    }

    @Transactional
    public Lesson updatePinning(Long id, boolean pinned, Long timeslotId, Long roomId) {
        return lessonRepo.findById(id)
                .map(lesson -> {
                    lesson.setPinned(pinned);
                    if (pinned) {
                        if (timeslotId != null) {
                            lesson.setTimeslot(timeslotRepo.findById(timeslotId).orElse(null));
                        }
                        if (roomId != null) {
                            lesson.setRoom(roomRepo.findById(roomId).orElse(null));
                        }
                    }
                    return lessonRepo.save(lesson);
                })
                .orElseThrow(() -> new RuntimeException("Lesson not found with id " + id));
    }

    @Transactional
    public void deleteLesson(Long id) {
        lessonRepo.deleteById(id);
    }
}

