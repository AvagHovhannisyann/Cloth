import { describe, expect, it } from "vitest";
import {
  currentSchoolDay,
  daySpan,
  PERIOD_TIMES,
  PERIODS,
  SCHOOL_DAYS,
  SEED_SCHEDULE,
  taughtLessons,
} from "../schedule";

describe("school schedule seed", () => {
  it("covers Monday to Friday with known period blocks", () => {
    for (const day of SCHOOL_DAYS) {
      const lessons = SEED_SCHEDULE[day];
      expect(lessons.length).toBe(PERIODS.length);
      for (const lesson of lessons) {
        expect(PERIODS).toContain(lesson.period);
        expect(PERIOD_TIMES[lesson.period]).toBeDefined();
      }
    }
  });

  it("computes day spans from first to last taught block", () => {
    // Tuesday runs 1-2 through 9-10.
    expect(daySpan(SEED_SCHEDULE[2])).toEqual({ start: "09:00", end: "17:10" });
    // Thursday has no 9-10.
    expect(daySpan(SEED_SCHEDULE[4])).toEqual({ start: "09:00", end: "15:20" });
    // Friday starts free, so lessons begin at 3-4.
    expect(daySpan(SEED_SCHEDULE[5])).toEqual({ start: "10:35", end: "17:10" });
    // Monday's free 5-6 sits inside the span without shrinking it.
    expect(daySpan(SEED_SCHEDULE[1])).toEqual({ start: "09:00", end: "15:20" });
  });

  it("treats blank subjects as free periods", () => {
    expect(taughtLessons(SEED_SCHEDULE[1]).map((l) => l.period)).toEqual([
      "1-2",
      "3-4",
      "7-8",
    ]);
  });

  it("maps weekends to Monday", () => {
    expect(currentSchoolDay(new Date(2026, 8, 6))).toBe(1); // a Sunday
    expect(currentSchoolDay(new Date(2026, 8, 1))).toBe(2); // a Tuesday
  });
});
