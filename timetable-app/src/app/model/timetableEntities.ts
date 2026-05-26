export interface Timetable {
  timeslots?: Timeslot[];
  rooms?: Room[];
  lessons?: Lesson[];
  timetableConstraintConfiguration?: any // TimetableConstraintConfiguration; - check if it is needed
  score?: HardMediumSoftScore | null;
  solverStatus?: SolverStatus | null;
  duration?: number;
  restrictionRules?: RestrictionRule[];
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
  appliedRuleIds?: number[];
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
  SEVENTH = 'SEVENTH',
  EIGHTH = 'EIGHTH',
  NINTH = 'NINTH',
  TENTH = 'TENTH',
  ELEVENTH = 'ELEVENTH',
  TWELVETH = 'TWELVETH',
  PREPARATORY = 'PREPARATORY',
  SMALL_GROUP = 'SMALL_GROUP',
  MIDDLE_GROUP = 'MIDDLE_GROUP',
  SENIOR_GROUP = 'SENIOR_GROUP'
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
  roomConflict: HardMediumSoftScore;
  teacherConflict: HardMediumSoftScore;
//   studentGroupConflict: HardMediumSoftScore;
  studentGroupConflictAdvanced: HardMediumSoftScore;
  capacityRoomConflict: HardMediumSoftScore;
  courseStudentsGroupedInTheSameRoom: HardMediumSoftScore;
  seminarStudentsGroupedInTheSameRoom: HardMediumSoftScore;
  labsStudentsGroupedInTheSameRoom: HardMediumSoftScore;
  roomConflictUniversity: HardMediumSoftScore;
  teacherConflictUniversity: HardMediumSoftScore;
  overlappingTimeslot: HardMediumSoftScore;
  maximumCoursesForStudents: HardMediumSoftScore;
  maximmumCoursesTeached: HardMediumSoftScore;
  maximizePreferredTimeslotAssignments: HardMediumSoftScore;
  coursesGroupedInTheSameTimeslot: HardMediumSoftScore;
  seminarsGroupedInTheSameTimeslot: HardMediumSoftScore;
  teacherRoomStability: HardMediumSoftScore;
  teacherTimeEfficiency: HardMediumSoftScore;
  studentGroupVariety: HardMediumSoftScore;
  gapsLongerThan4Hours: HardMediumSoftScore;
  labsGroupedInTheSameTimeslot: HardMediumSoftScore;
  coursesInTheSameBuilding: HardMediumSoftScore;
  noGapsForHighschool: HardMediumSoftScore;
  fairLessonsDistribution: HardMediumSoftScore;
  earlyStartForHighschool: HardMediumSoftScore;
  foreignLanguageSameTimeslot: HardMediumSoftScore;
  schoolRoomConflict: HardMediumSoftScore;
  schoolTeacherConflict: HardMediumSoftScore;
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

export enum RuleTargetType {
  ROOM = 'ROOM',
  TIMESLOT = 'TIMESLOT',
}

export enum RuleCriteriaField {
  NAME = 'NAME',
  BUILDING = 'BUILDING',
  CAPACITY = 'CAPACITY',
  DAY_OF_WEEK = 'DAY_OF_WEEK',
  START_TIME = 'START_TIME',
  END_TIME = 'END_TIME',
}

export enum RuleOperator {
  EQUALS = 'EQUALS',
  NOT_EQUALS = 'NOT_EQUALS',
  STARTS_WITH = 'STARTS_WITH',
  CONTAINS = 'CONTAINS',
  LESS_THAN = 'LESS_THAN',
  GREATER_THAN = 'GREATER_THAN',
  LESS_THAN_OR_EQUAL = 'LESS_THAN_OR_EQUAL',
  GREATER_THAN_OR_EQUAL = 'GREATER_THAN_OR_EQUAL',
  IN = 'IN',
}

export interface RestrictionRule {
  id?: number;
  name: string;
  targetType: RuleTargetType;
  criteriaField: RuleCriteriaField;
  operator: RuleOperator;
  criteriaValue: string;
  active: boolean;
}

export const CRITERIA_FIELDS_BY_TARGET: Record<RuleTargetType, RuleCriteriaField[]> = {
  [RuleTargetType.ROOM]: [RuleCriteriaField.NAME, RuleCriteriaField.BUILDING, RuleCriteriaField.CAPACITY],
  [RuleTargetType.TIMESLOT]: [RuleCriteriaField.DAY_OF_WEEK, RuleCriteriaField.START_TIME, RuleCriteriaField.END_TIME],
};

export const OPERATORS_BY_FIELD: Record<RuleCriteriaField, RuleOperator[]> = {
  [RuleCriteriaField.NAME]: [RuleOperator.EQUALS, RuleOperator.NOT_EQUALS, RuleOperator.STARTS_WITH, RuleOperator.CONTAINS, RuleOperator.IN],
  [RuleCriteriaField.BUILDING]: [RuleOperator.EQUALS, RuleOperator.NOT_EQUALS, RuleOperator.STARTS_WITH, RuleOperator.CONTAINS, RuleOperator.IN],
  [RuleCriteriaField.CAPACITY]: [RuleOperator.EQUALS, RuleOperator.NOT_EQUALS, RuleOperator.LESS_THAN, RuleOperator.GREATER_THAN, RuleOperator.LESS_THAN_OR_EQUAL, RuleOperator.GREATER_THAN_OR_EQUAL],
  [RuleCriteriaField.DAY_OF_WEEK]: [RuleOperator.EQUALS, RuleOperator.NOT_EQUALS, RuleOperator.IN],
  [RuleCriteriaField.START_TIME]: [RuleOperator.EQUALS, RuleOperator.NOT_EQUALS, RuleOperator.LESS_THAN, RuleOperator.GREATER_THAN, RuleOperator.LESS_THAN_OR_EQUAL, RuleOperator.GREATER_THAN_OR_EQUAL],
  [RuleCriteriaField.END_TIME]: [RuleOperator.EQUALS, RuleOperator.NOT_EQUALS, RuleOperator.LESS_THAN, RuleOperator.GREATER_THAN, RuleOperator.LESS_THAN_OR_EQUAL, RuleOperator.GREATER_THAN_OR_EQUAL],
};
