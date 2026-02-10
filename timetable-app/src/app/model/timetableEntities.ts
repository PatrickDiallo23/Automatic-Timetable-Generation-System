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
  pinned?: boolean;
  /** Indicates if this lesson has any assignment restrictions */
  hasRestrictions?: boolean;
  /** Applied restriction rule IDs (empty = no restrictions) */
  appliedRuleIds?: number[];
  /** How to combine room rules: AND or OR */
  roomRuleCombination?: RuleCombination;
  /** How to combine timeslot rules: AND or OR */
  timeslotRuleCombination?: RuleCombination;
}

/** How multiple rules of the same target type combine */
export enum RuleCombination {
  AND = 'AND',
  OR = 'OR'
}

/** What entity type a restriction rule filters */
export enum RuleTargetType {
  ROOM = 'ROOM',
  TIMESLOT = 'TIMESLOT'
}

/** Comparison operators for criteria-based rules */
export enum RuleOperator {
  EQUALS = 'EQUALS',
  NOT_EQUALS = 'NOT_EQUALS',
  IN = 'IN',
  NOT_IN = 'NOT_IN',
  GREATER_THAN_OR_EQUAL = 'GREATER_THAN_OR_EQUAL',
  LESS_THAN = 'LESS_THAN',
  CONTAINS = 'CONTAINS'
}

/**
 * A reusable restriction rule that filters rooms or timeslots.
 * Supports criteria-based mode (field/operator/value) and specific-items mode (IDs).
 */
export interface RestrictionRule {
  id?: number;
  name: string;
  targetType: RuleTargetType;
  /** Criteria mode fields (null/empty when using specific items) */
  criteriaField?: string;
  operator?: RuleOperator;
  criteriaValue?: string;
  /** Specific items mode (empty when using criteria) */
  specificRoomIds?: number[];
  specificTimeslotIds?: number[];
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
