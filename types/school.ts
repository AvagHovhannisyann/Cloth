/** School timetable types. */

/** Monday=1 … Friday=5 (matches Date#getDay for weekdays). */
export type SchoolDayIndex = 1 | 2 | 3 | 4 | 5;

/** Paired lesson blocks as the school runs them. */
export type LessonPeriod = "1-2" | "3-4" | "5-6" | "7-8" | "9-10";

export interface Lesson {
  period: LessonPeriod;
  /** Empty string = free period. */
  subject: string;
  teacher?: string;
}

export type WeekSchedule = Record<SchoolDayIndex, Lesson[]>;

export type BellKind = "lesson" | "break" | "marker";

export interface BellEntry {
  label: string;
  time: string;
  kind: BellKind;
}
