import type { WearRecord } from "@/types/history";
import { daysBetween } from "./dates";

/** Days since a garment was last worn according to history; null if never. */
export function daysSinceGarmentWorn(
  garmentId: string,
  history: WearRecord[],
  todayIso: string,
): number | null {
  let best: number | null = null;
  for (const rec of history) {
    if (rec.topId === garmentId || rec.bottomId === garmentId || rec.shoeId === garmentId) {
      const d = daysBetween(rec.dateISO, todayIso);
      if (best === null || d < best) best = d;
    }
  }
  return best;
}

/** Days since this exact top+bottom+shoe combination was worn; null if never. */
export function daysSinceComboWorn(
  topId: string,
  bottomId: string,
  shoeId: string,
  history: WearRecord[],
  todayIso: string,
): number | null {
  let best: number | null = null;
  for (const rec of history) {
    if (rec.topId === topId && rec.bottomId === bottomId && rec.shoeId === shoeId) {
      const d = daysBetween(rec.dateISO, todayIso);
      if (best === null || d < best) best = d;
    }
  }
  return best;
}

export function recordsForDate(history: WearRecord[], dateISO: string): WearRecord[] {
  return history.filter((r) => r.dateISO === dateISO);
}
