import type { OccasionId } from "./context";
import type { GeoLocation } from "./weather";

export type ComfortProfile = "runs-cold" | "balanced" | "runs-warm";

export type ThemePreference = "light" | "dark" | "system";

export interface AppSettings {
  comfort: ComfortProfile;
  defaultOccasion: OccasionId;
  /** Days before the exact same outfit may resurface without penalty. */
  exactOutfitCooldownDays: number;
  topCooldownDays: number;
  bottomCooldownDays: number;
  theme: ThemePreference;
  weatherMode: "auto" | "manual";
  manualLocation?: GeoLocation;
  /** Reported physical wardrobe size — drives the "35 / 45 catalogued" indicator. */
  wardrobeTargetCount: number;
  /** First-run welcome dismissed. */
  introSeen: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  comfort: "balanced",
  defaultOccasion: "school",
  exactOutfitCooldownDays: 12,
  topCooldownDays: 4,
  bottomCooldownDays: 3,
  theme: "system",
  weatherMode: "auto",
  wardrobeTargetCount: 45,
  introSeen: false,
};

/**
 * Transparent learned preference. Values drift in a small bounded range and
 * translate to a few points of score — never enough to override weather,
 * dress code, or availability.
 */
export interface PreferenceState {
  /** -1 … +1 per garment id. */
  garmentAffinity: Record<string, number>;
  /** -1 … +1 per outfit id. */
  outfitAffinity: Record<string, number>;
}
