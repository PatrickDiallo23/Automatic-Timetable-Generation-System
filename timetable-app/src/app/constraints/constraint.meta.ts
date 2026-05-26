export interface ConstraintMeta {
    id: string; 
    title: string; 
    description: string; 
    recommendedWeight: 'HARD' | 'MEDIUM' | 'SOFT';
    recommendationReason: string;
}

export const CONSTRAINT_DICTIONARY: ConstraintMeta[] = [
    {
        id: "roomConflictUniversity",
        title: "Room Conflict (University)",
        description: "A room can accommodate at most one lesson at the same time. Correctly maps shared series/streams to avoid false conflicts.",
        recommendedWeight: "HARD",
        recommendationReason: "Prevents physical double-booking of rooms."
    },
    {
        id: "teacherConflictUniversity",
        title: "Teacher Conflict (University)",
        description: "A teacher can teach at most one lesson at the same time. Exempts instances where multiple groups from the same series dynamically share a teacher.",
        recommendedWeight: "HARD",
        recommendationReason: "Prevents assigning one teacher to multiple disparate classes concurrently."
    },
    {
        id: "roomConflict",
        title: "Room Conflict",
        description: "A room can accommodate at most one lesson at the same time.",
        recommendedWeight: "HARD",
        recommendationReason: "Prevents physical double-booking of rooms."
    },
    {
        id: "teacherConflict",
        title: "Teacher Conflict",
        description: "A teacher can teach at most one lesson at the same time.",
        recommendedWeight: "HARD",
        recommendationReason: "Prevents assigning one teacher to multiple disparate classes concurrently."
    },
    {
        id: "studentGroupConflictAdvanced",
        title: "Student Group Conflict",
        description: "A specific student cohort can attend at most one lesson at the same time.",
        recommendedWeight: "HARD",
        recommendationReason: "Prevents scheduling students to be in two separate places at once."
    },
    {
        id: "capacityRoomConflict",
        title: "Room Capacity Limit",
        description: "Verifies that the total number of students attending the lesson does not exceed the room's maximum seat capacity.",
        recommendedWeight: "HARD",
        recommendationReason: "Fire safety and seating limitations dictate rooms shouldn't be overbooked."
    },
    {
        id: "courseStudentsGroupedInTheSameRoom",
        title: "Course Students in Same Room",
        description: "Forces all student groups belonging to the same series to be grouped into one large room for Course lessons.",
        recommendedWeight: "HARD",
        recommendationReason: "Courses are generally given to an entire series concurrently to save teacher time."
    },
    {
        id: "seminarStudentsGroupedInTheSameRoom",
        title: "Seminar Students in Same Room",
        description: "Groups semi-groups within specific seminar constraints properly without exceeding capacity.",
        recommendedWeight: "HARD",
        recommendationReason: "Seminar structure requires keeping correct sub-groups together."
    },
    {
        id: "labsStudentsGroupedInTheSameRoom",
        title: "Lab Students in Same Room",
        description: "Groups lab sub-groups together efficiently.",
        recommendedWeight: "HARD",
        recommendationReason: "Lab sizes must strictly map to student sub-segments."
    },
    {
        id: "overlappingTimeslot",
        title: "Overlapping Timeslots",
        description: "Heavily penalizes overlapping lessons for the same student group.",
        recommendedWeight: "HARD",
        recommendationReason: "Mandatory for resolving time-flow overlaps instead of just equal timeslots."
    },
    {
        id: "maximumCoursesForStudents",
        title: "Max Daily Hours (Students)",
        description: "Limits exactly how many course hours a student group can have in a single day.",
        recommendedWeight: "MEDIUM",
        recommendationReason: "Keeps students from burning out (e.g. 10 hours per day), but can be bypassed if the timetable guarantees no alternatives exist."
    },
    {
        id: "maximmumCoursesTeached",
        title: "Max Daily Hours (Teachers)",
        description: "Limits exactly how many hours a teacher can be actively teaching in a single day.",
        recommendedWeight: "MEDIUM",
        recommendationReason: "Ensures teacher workload respects union or legal working limits per day (e.g. 12 hours per day)."
    },
    {
        id: "maximizePreferredTimeslotAssignments",
        title: "Teacher Time Preferences",
        description: "Schedules lessons strictly within the stated time availability specified by the teacher.",
        recommendedWeight: "MEDIUM",
        recommendationReason: "Allows respecting visiting staff or partial-time teachers' schedules."
    },
    {
        id: "coursesGroupedInTheSameTimeslot",
        title: "Sync Courses",
        description: "Ensures groups in the same series run their COURSE lessons simultaneously.",
        recommendedWeight: "MEDIUM",
        recommendationReason: "Keeps the academic series structure grouped together logically."
    },
    {
        id: "seminarsGroupedInTheSameTimeslot",
        title: "Sync Seminars",
        description: "Ensures identical subgroups run their SEMINAR lessons simultaneously where possible.",
        recommendedWeight: "MEDIUM",
        recommendationReason: "Provides clean time-syncing for administrative ease."
    },
    {
        id: "teacherRoomStability",
        title: "Teacher Room Stability",
        description: "Encourages placing consecutive lessons taught by the same teacher into the identical room.",
        recommendedWeight: "SOFT",
        recommendationReason: "Prevents the teacher from having to walk across campus with materials between classes."
    },
    {
        id: "teacherTimeEfficiency",
        title: "Teacher Time Efficiency",
        description: "Instructs the scheduler to avoid assigning long arbitrary gaps directly into a teacher's schedule.",
        recommendedWeight: "SOFT",
        recommendationReason: "A nice-to-have comfort feature for staff so they don't 'wait' endlessly on campus."
    },
    {
        id: "studentGroupVariety",
        title: "Lesson Variety (Students)",
        description: "Student groups dislike having consecutive lessons spanning the identical subject back-to-back.",
        recommendedWeight: "SOFT",
        recommendationReason: "Boosts student focus and educational outcomes by mixing course subjects."
    },
    {
        id: "coursesInTheSameBuilding",
        title: "Same Building Grouping",
        description: "Minimizes the distance students must walk by forcing consecutive lessons to happen inside the same physical building.",
        recommendedWeight: "SOFT",
        recommendationReason: "Avoids punishing transition periods for students between disparate campus buildings."
    },
    {
        id: "gapsLongerThan4Hours",
        title: "Padded Gaps Control",
        description: "Penalizes gaps spanning longer than 4 hours in a single continuous day for students.",
        recommendedWeight: "SOFT",
        recommendationReason: "A major QoL (Quality of Life) improvement so students don't need to return home halfway through a day."
    },
    {
        id: "labsGroupedInTheSameTimeslot",
        title: "Sync Labs",
        description: "Keeps laboratory lessons efficiently synced between subgroups.",
        recommendedWeight: "SOFT",
        recommendationReason: "Good for resource usage and concurrent tracking."
    },
    {
        id: "noGapsForHighschool",
        title: "Highschool Gap Control",
        description: "A strict variant that heavily penalizes ANY gaps (free periods) whatsoever in highschool timetables.",
        recommendedWeight: "HARD",
        recommendationReason: "Younger students require continuous supervision and cannot just be left in free-periods safely."
    },
    {
        id: "fairLessonsDistribution",
        title: "Fair Daily Load Distribution",
        description: "Minimizes variance in the schedule so days have somewhat equal volumes of lessons taught.",
        recommendedWeight: "SOFT",
        recommendationReason: "Prevents a student from having an 8-hour day followed by a 1-hour day."
    },
    {
        id: "earlyStartForHighschool",
        title: "Early Start Priority",
        description: "Enforces starting the timetable as early as possible close to 08:00 AM.",
        recommendedWeight: "SOFT",
        recommendationReason: "Matches traditional structural expectations for high schools."
    },
    {
        id: "foreignLanguageSameTimeslot",
        title: "Synchronized Foreign Languages",
        description: "Creates magnet timeslots for multiple concurrent foreign language classes across the same study year.",
        recommendedWeight: "HARD",
        recommendationReason: "Critical for years where students break into independent cohorts dynamically based on language choice."
    },
    {
        id: "schoolRoomConflict",
        title: "School-Level Room Conflict",
        description: "An isolated Room Conflict constraint that specifically supports bypassing synced foreign language classes.",
        recommendedWeight: "HARD",
        recommendationReason: "Required exclusively for running highschool logic paired with dynamic languages."
    },
    {
        id: "schoolTeacherConflict",
        title: "School-Level Teacher Conflict",
        description: "An isolated Teacher Conflict constraint customized for specialized school environments.",
        recommendedWeight: "HARD",
        recommendationReason: "Prevents staff double-booking in schools."
    }
];
