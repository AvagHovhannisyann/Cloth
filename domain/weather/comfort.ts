import type { ComfortProfile } from "@/types/settings";
import type { WeatherSnapshot } from "@/types/weather";
import { COMFORT_SHIFT } from "@/domain/recommendation/constants";

/**
 * The temperatures the engine dresses for, shifted by the user's comfort
 * profile. An outfit is worn across the whole day, so the warmest point of
 * the wearing window matters as much as the temperature right now — a knit
 * chosen on a 14°C morning must still be wearable at a 28°C afternoon high.
 */
export interface WearingTemperatures {
  /** Comfort-adjusted feels-like at the moment of choosing. */
  now: number;
  /** Comfort-adjusted warmest point of the day (never below `now`). */
  peak: number;
  /** Midpoint used for warmth-fit scoring. */
  blended: number;
}

export function wearingTemperatures(
  weather: WeatherSnapshot | null,
  comfort: ComfortProfile,
): WearingTemperatures | null {
  if (!weather) return null;
  const shift = COMFORT_SHIFT[comfort];
  const now = weather.feelsLike + shift;
  const peak = Math.max(now, weather.high + shift);
  return { now, peak, blended: (now + peak) / 2 };
}
