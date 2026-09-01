"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Pencil } from "lucide-react";
import { useHydration } from "@/hooks/useHydration";
import { useAppStore } from "@/lib/store";
import {
  BELL_TIMES,
  BREAK_AFTER,
  currentSchoolDay,
  DAY_LABELS,
  PERIOD_TIMES,
  PERIODS,
  SCHOOL_DAYS,
  SEED_SCHEDULE,
  taughtLessons,
} from "@/data/schedule";
import type { Lesson, SchoolDayIndex } from "@/types/school";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Skeleton } from "@/components/ui/Skeleton";
import { Sheet } from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/Field";
import { cn } from "@/lib/utils";

function useDayLessons(day: SchoolDayIndex): Lesson[] {
  const overrides = useAppStore((s) => s.scheduleOverrides);
  return overrides[day] ?? SEED_SCHEDULE[day];
}

function LessonRow({ lesson, isNow }: { lesson: Lesson; isNow: boolean }) {
  const times = PERIOD_TIMES[lesson.period];
  const free = lesson.subject.trim().length === 0;

  return (
    <div
      className={cn(
        "flex items-baseline justify-between gap-4 rounded-lg px-5 py-4",
        free
          ? "border border-dashed border-line-strong"
          : "border border-line bg-surface shadow-card",
        isNow && !free && "border-ink",
      )}
    >
      <div className="min-w-0">
        <p
          className={cn(
            "text-[0.9375rem] font-semibold leading-snug tracking-tight",
            free && "font-normal text-ink-faint",
          )}
        >
          {free ? "Free" : lesson.subject}
        </p>
        {lesson.teacher ? (
          <p className="mt-0.5 truncate text-sm text-ink-secondary">{lesson.teacher}</p>
        ) : null}
      </div>
      <div className="shrink-0 text-right">
        <p className="text-xs font-medium tabular-nums text-ink-secondary">
          {times.start}–{times.end}
        </p>
        <p className="label-caps mt-0.5 text-ink-faint">Lessons {lesson.period}</p>
      </div>
    </div>
  );
}

function BreakCaption({ label, time }: { label: string; time: string }) {
  return (
    <p className="py-2 text-center text-xs text-ink-faint">
      {label} · {time}
    </p>
  );
}

export function ScheduleScreen() {
  const hydrated = useHydration();
  const setDaySchedule = useAppStore((s) => s.setDaySchedule);
  const [day, setDay] = useState<SchoolDayIndex>(() => currentSchoolDay());
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Lesson[]>([]);
  const [bellsOpen, setBellsOpen] = useState(false);

  const lessons = useDayLessons(day);

  // Trim trailing free blocks; keep leading/middle ones so times stay honest.
  const visible = useMemo(() => {
    const lastTaught = lessons.reduce(
      (acc, l, i) => (l.subject.trim() ? i : acc),
      -1,
    );
    return lastTaught === -1 ? [] : lessons.slice(0, lastTaught + 1);
  }, [lessons]);

  const isToday = hydrated && currentSchoolDay() === day && [1, 2, 3, 4, 5].includes(new Date().getDay());
  const nowHm = new Date().toTimeString().slice(0, 5);

  const startEdit = () => {
    setDraft(
      PERIODS.map(
        (period) =>
          lessons.find((l) => l.period === period) ?? { period, subject: "" },
      ),
    );
    setEditing(true);
  };

  const saveEdit = () => {
    setDaySchedule(
      day,
      draft.map((l) => ({
        ...l,
        subject: l.subject.trim(),
        teacher: l.teacher?.trim() || undefined,
      })),
    );
    setEditing(false);
    toast(`${DAY_LABELS[day].long} updated`);
  };

  if (!hydrated) {
    return (
      <div className="px-6 pb-tabbar pt-safe">
        <div className="space-y-4 pt-10">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-full" />
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 pb-tabbar pt-safe">
      <header className="flex items-end justify-between pt-8 sm:pt-10">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">School</h1>
          <p className="mt-1 text-sm text-ink-secondary">
            {DAY_LABELS[day].long}
            {isToday ? " · Today" : ""}
          </p>
        </div>
        <button
          type="button"
          onClick={startEdit}
          aria-label={`Edit ${DAY_LABELS[day].long}`}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-line-strong text-ink-secondary transition-colors hover:text-ink"
        >
          <Pencil size={16} aria-hidden />
        </button>
      </header>

      <SegmentedControl
        ariaLabel="School day"
        className="mt-5 w-full"
        options={SCHOOL_DAYS.map((d) => ({ value: String(d), label: DAY_LABELS[d].short }))}
        value={String(day)}
        onChange={(v) => setDay(Number(v) as SchoolDayIndex)}
      />

      <section className="mx-auto mt-5 max-w-xl">
        {visible.length === 0 ? (
          <p className="rounded-lg border border-dashed border-line-strong px-6 py-10 text-center text-sm text-ink-secondary">
            No lessons set for {DAY_LABELS[day].long}.
          </p>
        ) : (
          <div className="space-y-1">
            {visible.map((lesson, i) => {
              const times = PERIOD_TIMES[lesson.period];
              const isNow =
                isToday && nowHm >= times.start && nowHm <= times.end;
              const breakInfo =
                i < visible.length - 1 ? BREAK_AFTER[lesson.period] : undefined;
              return (
                <div key={lesson.period}>
                  <LessonRow lesson={lesson} isNow={isNow} />
                  {breakInfo ? (
                    <BreakCaption label={breakInfo.label} time={breakInfo.time} />
                  ) : null}
                </div>
              );
            })}
          </div>
        )}

        {taughtLessons(lessons).length > 0 ? (
          <p className="mt-4 text-center text-xs text-ink-faint">
            Departure 15:30 · Final departure 17:20
          </p>
        ) : null}

        <div className="mt-8 flex justify-center">
          <Button variant="ghost" size="sm" onClick={() => setBellsOpen(true)}>
            Day rhythm
          </Button>
        </div>
      </section>

      {/* Full bell table */}
      <Sheet open={bellsOpen} onOpenChange={setBellsOpen} title="Day rhythm">
        <ul className="divide-y divide-line">
          {BELL_TIMES.map((entry) => (
            <li
              key={`${entry.label}-${entry.time}`}
              className="flex items-baseline justify-between gap-6 py-2.5"
            >
              <span
                className={cn(
                  "text-sm",
                  entry.kind === "lesson" ? "font-medium text-ink" : "text-ink-secondary",
                )}
              >
                {entry.label}
              </span>
              <span className="shrink-0 text-sm tabular-nums text-ink-secondary">
                {entry.time}
              </span>
            </li>
          ))}
        </ul>
      </Sheet>

      {/* Day editor */}
      <Sheet
        open={editing}
        onOpenChange={setEditing}
        title={`Edit ${DAY_LABELS[day].long}`}
      >
        <div className="space-y-5">
          {draft.map((lesson, i) => (
            <div key={lesson.period} className="space-y-2">
              <p className="label-caps text-ink-secondary">
                Lessons {lesson.period} · {PERIOD_TIMES[lesson.period].start}–
                {PERIOD_TIMES[lesson.period].end}
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                <TextInput
                  value={lesson.subject}
                  aria-label={`Subject, lessons ${lesson.period}`}
                  placeholder="Subject (blank = free)"
                  onChange={(e) =>
                    setDraft((d) =>
                      d.map((x, xi) => (xi === i ? { ...x, subject: e.target.value } : x)),
                    )
                  }
                />
                <TextInput
                  value={lesson.teacher ?? ""}
                  aria-label={`Teacher, lessons ${lesson.period}`}
                  placeholder="Teacher"
                  onChange={(e) =>
                    setDraft((d) =>
                      d.map((x, xi) => (xi === i ? { ...x, teacher: e.target.value } : x)),
                    )
                  }
                />
              </div>
            </div>
          ))}
          <div className="flex gap-2.5 pt-1">
            <Button className="flex-1" onClick={() => setEditing(false)}>
              Cancel
            </Button>
            <Button variant="primary" className="flex-1" onClick={saveEdit}>
              Save
            </Button>
          </div>
        </div>
      </Sheet>
    </div>
  );
}
