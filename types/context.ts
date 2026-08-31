import type { StyleGroup } from "./garment";
import type { WeatherSnapshot } from "./weather";

export type OccasionId =
  | "school"
  | "important-school"
  | "presentation"
  | "exam"
  | "meeting"
  | "conference"
  | "casual"
  | "sport"
  | "weekend"
  | "dinner"
  | "travel"
  | "custom";

export interface OccasionPreset {
  id: OccasionId;
  label: string;
  /** Ideal outfit formality, 1–10. */
  formalityTarget: number;
  /** Hard floor — outfits below this are rejected. */
  formalityMin: number;
  /** Hard ceiling — outfits above read overdressed and are rejected. */
  formalityMax: number;
  /** Additive score bias per style branch (points on a 0–100 scale). */
  styleBias: Partial<Record<StyleGroup, number>>;
}

export type DressCodeId =
  | "none"
  | "all-white"
  | "dark-colors"
  | "no-sportswear"
  | "smart-casual"
  | "formal"
  | "casual";

export interface DressCodePreset {
  id: DressCodeId;
  label: string;
  description: string;
}

/** Everything the engine needs to know about "today". */
export interface DayContext {
  /** YYYY-MM-DD in the user's local time. */
  dateISO: string;
  occasion: OccasionId;
  dressCode: DressCodeId;
  weather: WeatherSnapshot | null;
}
