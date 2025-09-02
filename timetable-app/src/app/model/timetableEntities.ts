export interface Timetable {
  timeslots?: Timeslot[];
  rooms?: Room[];
  lessons?: Lesson[];
  timetableConstraintConfiguration?: any // TimetableConstraintConfiguration; - check if it is needed
  score?: HardMediumSoftScore | null;
  solverStatus?: SolverStatus | null;
  duration?: number;
}

export interface Data {
  timeslots: Timeslot[],
  rooms: Room[],
  lessons: Lesson[]
}

export interface HardMediumSoftScore {
  initScore: number;
  hardScore: number;
  mediumScore: number;
  softScore: number;
}

export enum SolverStatus {
  SOLVING_SCHEDULED = 'SOLVING_SCHEDULED',
  SOLVING_ACTIVE = 'SOLVING_ACTIVE',
  NOT_SOLVING = 'NOT_SOLVING',
}

export interface Lesson {
  id?: number;
  subject: string;
  teacher: Teacher;
  studentGroup: StudentGroup;
  lessonType: LessonType;
  year: Year;
  duration: number;
  timeslot?: any // Timeslot or number
  room?: any; //Room or number
}

export enum LessonType {
  SEMINAR = 'SEMINAR',
  COURSE = 'COURSE',
  LABORATORY = 'LABORATORY',
  PROJECT = 'PROJECT',
}

export interface Timeslot {
  id?: number;
  dayOfWeek?: string;
  startTime?: string;
  endTime?: string;
}

export interface Room {
  id?: number;
  name?: string;
  capacity?: number;
  building?: string;
}

export interface TeacherTimeslot {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}

export interface Teacher {
  id?: number;
  name?: string;
  preferredTimeslots?: TeacherTimeslot[];
}

export interface StudentGroup {
  id?: number;
  year?: Year;
  name?: string;
  studentGroup?: string;
  semiGroup?: SemiGroup;
  numberOfStudents?: number;
}

export enum Year {
  FIRST = 'FIRST',
  SECOND = 'SECOND',
  THIRD = 'THIRD',
  FOURTH = 'FOURTH',
  FIFTH = 'FIFTH',
  SIXTH = 'SIXTH',
}

export enum SemiGroup {
  SEMI_GROUP0 = 'SEMI_GROUP0',
  SEMI_GROUP1 = 'SEMI_GROUP1',
  SEMI_GROUP2 = 'SEMI_GROUP2',
  //SEMI_GROUP0 is for Master students
}

export interface Constraint {
  id?: number;
  description?: string;
  weight?: string;
}

export interface TimetableConstraintConfiguration {
//   roomConflict: HardMediumSoftScore;
//   teacherConflict: HardMediumSoftScore;
//   studentGroupConflict: HardMediumSoftScore;
  studentGroupConflictAdvanced: HardMediumSoftScore;
  capacityRoomConflict: HardMediumSoftScore;
  courseStudentsGroupedInTheSameRoom: HardMediumSoftScore;
  seminarStudentsGroupedInTheSameRoom: HardMediumSoftScore;
  labsStudentsGroupedInTheSameRoom: HardMediumSoftScore;
  roomConflictUniversity: HardMediumSoftScore;
  teacherConflictUniversity: HardMediumSoftScore;
  overlappingTimeslot: HardMediumSoftScore;
  lessonDurationConflict: HardMediumSoftScore;
  maximumCoursesForStudents: HardMediumSoftScore;
  maximmumCoursesTeached: HardMediumSoftScore;
  maximizePreferredTimeslotAssignments: HardMediumSoftScore;
  coursesGroupedInTheSameTimeslot: HardMediumSoftScore;
  seminarsGroupedInTheSameTimeslot: HardMediumSoftScore;
  teacherRoomStability: HardMediumSoftScore;
  teacherTimeEfficiency: HardMediumSoftScore;
//   studentGroupVariety: HardMediumSoftScore;
  gapsLongerThan4Hours: HardMediumSoftScore;
  labsGroupedInTheSameTimeslot: HardMediumSoftScore;
  coursesInTheSameBuilding: HardMediumSoftScore;
}

export interface BenchmarkRequest {
  source: 'imported' | 'database';
  timetable?: Timetable;
}

export interface BenchmarkResponse {
  reportUrl: string;
}

export interface AggregationResponse {
  status: string;
  message: string;
  reportPath?: string;
  reportFileName?: string;
  selectedDirectories?: string[];
}

export interface AvailableBenchmarksResponse {
  status: string;
  directories: string[];
  count: number;
}

export interface BenchmarkDirectory {
  name: string;
  selected: boolean;
}
