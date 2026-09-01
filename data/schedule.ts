import type {
  BellEntry,
  Lesson,
  LessonPeriod,
  SchoolDayIndex,
  WeekSchedule,
} from "@/types/school";

/**
 * The school week as read from the Shirakatsy diary. Two blocks the diary
 * itself shows empty (Monday 5–6, Friday 1–2) are seeded as free periods —
 * editable in the app once known.
 */
export const SEED_SCHEDULE: WeekSchedule = {
  1: [
    { period: "1-2", subject: "Mathematics AA", teacher: "Նունե Գրիգորյան" },
    { period: "3-4", subject: "Armenian A", teacher: "Անի Պապոյան" },
    { period: "5-6", subject: "" },
    { period: "7-8", subject: "Business management", teacher: "Նունե Վարդանյան" },
    { period: "9-10", subject: "" },
  ],
  2: [
    {
      period: "1-2",
      subject: "ՆԶՊ և անվտանգ կենսագործունեություն",
      teacher: "Վարդան Պետրոսյան",
    },
    { period: "3-4", subject: "Design technology", teacher: "Աշխեն Սարգսյան" },
    { period: "5-6", subject: "Mathematics AA", teacher: "Նունե Գրիգորյան" },
    { period: "7-8", subject: "Economics", teacher: "Մարիաննա Արզանգուլյան" },
    { period: "9-10", subject: "English B", teacher: "Անահիտ Ղարաղազարյան" },
  ],
  3: [
    { period: "1-2", subject: "English B", teacher: "Անահիտ Ղարաղազարյան" },
    { period: "3-4", subject: "Armenian A", teacher: "Անի Պապոյան" },
    { period: "5-6", subject: "TOK", teacher: "Քրիստինե Սահակյան" },
    { period: "7-8", subject: "Business management", teacher: "Նունե Վարդանյան" },
    { period: "9-10", subject: "Economics", teacher: "Մարիաննա Արզանգուլյան" },
  ],
  4: [
    { period: "1-2", subject: "History N", teacher: "Աննա Միքայելյան" },
    { period: "3-4", subject: "Design technology", teacher: "Աշխեն Սարգսյան" },
    { period: "5-6", subject: "Mathematics AA", teacher: "Նունե Գրիգորյան" },
    { period: "7-8", subject: "Economics", teacher: "Մարիաննա Արզանգուլյան" },
    { period: "9-10", subject: "" },
  ],
  5: [
    { period: "1-2", subject: "" },
    { period: "3-4", subject: "Physical edu.", teacher: "Գոհար Հովհաննիսյան" },
    { period: "5-6", subject: "Assembly Agenda", teacher: "New Teacher" },
    { period: "7-8", subject: "English B", teacher: "Անահիտ Ղարաղազարյան" },
    { period: "9-10", subject: "Business management", teacher: "Նունե Վարդանյան" },
  ],
};

export const PERIODS: LessonPeriod[] = ["1-2", "3-4", "5-6", "7-8", "9-10"];

/** Start/end of each paired lesson block, from the bell times. */
export const PERIOD_TIMES: Record<LessonPeriod, { start: string; end: string }> = {
  "1-2": { start: "09:00", end: "10:20" },
  "3-4": { start: "10:35", end: "11:55" },
  "5-6": { start: "12:05", end: "13:25" },
  "7-8": { start: "14:00", end: "15:20" },
  "9-10": { start: "15:50", end: "17:10" },
};

/** The break that follows each block, shown between rows. */
export const BREAK_AFTER: Partial<Record<LessonPeriod, { label: string; time: string }>> = {
  "1-2": { label: "Breakfast", time: "10:20–10:35" },
  "3-4": { label: "Break", time: "11:55–12:05" },
  "5-6": { label: "Lunch", time: "13:25–14:00" },
  "7-8": { label: "Lunch / rest", time: "15:20–15:50" },
};

/** The full day rhythm, verbatim from the school's hours. */
export const BELL_TIMES: BellEntry[] = [
  { label: "1st lesson", time: "09:00–09:40", kind: "lesson" },
  { label: "2nd lesson", time: "09:45–10:20", kind: "lesson" },
  { label: "Breakfast", time: "10:20–10:35", kind: "break" },
  { label: "3rd lesson", time: "10:35–11:15", kind: "lesson" },
  { label: "4th lesson", time: "11:20–11:55", kind: "lesson" },
  { label: "Break", time: "11:55–12:05", kind: "break" },
  { label: "5th lesson", time: "12:05–12:45", kind: "lesson" },
  { label: "6th lesson", time: "12:50–13:25", kind: "lesson" },
  { label: "Lunch", time: "13:25–14:00", kind: "break" },
  { label: "7th lesson", time: "14:00–14:40", kind: "lesson" },
  { label: "8th lesson", time: "14:45–15:20", kind: "lesson" },
  { label: "Departure", time: "15:30", kind: "marker" },
  { label: "Lunch / rest", time: "15:20–16:00", kind: "break" },
  {
    label: "Independent work & extracurricular (9th–10th lessons)",
    time: "15:50–17:10",
    kind: "lesson",
  },
  { label: "Final departure", time: "17:20", kind: "marker" },
];

export const DAY_LABELS: Record<SchoolDayIndex, { long: string; short: string }> = {
  1: { long: "Monday", short: "Mon" },
  2: { long: "Tuesday", short: "Tue" },
  3: { long: "Wednesday", short: "Wed" },
  4: { long: "Thursday", short: "Thu" },
  5: { long: "Friday", short: "Fri" },
};

export const SCHOOL_DAYS: SchoolDayIndex[] = [1, 2, 3, 4, 5];

export function isSchoolDayIndex(d: number): d is SchoolDayIndex {
  return d >= 1 && d <= 5;
}

/** Today's school day, or Monday on weekends. */
export function currentSchoolDay(date: Date = new Date()): SchoolDayIndex {
  const d = date.getDay();
  return isSchoolDayIndex(d) ? d : 1;
}

export function taughtLessons(lessons: Lesson[]): Lesson[] {
  return lessons.filter((l) => l.subject.trim().length > 0);
}

/** First-lesson start and last-lesson end for a day; null when fully free. */
export function daySpan(lessons: Lesson[]): { start: string; end: string } | null {
  const taught = taughtLessons(lessons);
  const first = taught[0];
  const last = taught[taught.length - 1];
  if (!first || !last) return null;
  return { start: PERIOD_TIMES[first.period].start, end: PERIOD_TIMES[last.period].end };
}
