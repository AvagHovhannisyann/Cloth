/** Conceptual weights from the product brief (§26). Sum to 1. */
export const WEIGHTS = {
  base: 0.25,
  weather: 0.2,
  formality: 0.15,
  style: 0.15,
  color: 0.1,
  recency: 0.1,
  preference: 0.05,
} as const;

/** Flat additive bonuses on the final 0–100+ scale. */
export const TIER_BONUS = { signature: 4, strong: 2, acceptable: 0 } as const;
export const FAVORITE_OUTFIT_BONUS = 3;
export const FAVORITE_GARMENT_BONUS = 1; // per favourite garment, capped
export const FAVORITE_GARMENT_BONUS_CAP = 2;
export const OCCASION_TAG_BONUS = 2;

/** Elite band: candidates within this many points of the best stay in play. */
export const ELITE_MARGIN = 6;
export const ELITE_MAX = 5;

/** Recency penalties (points off the recency component, which starts at 100). */
export const EXACT_REPEAT_PENALTY_MAX = 90;
export const TOP_REPEAT_PENALTY_MAX = 35;
export const BOTTOM_REPEAT_PENALTY_MAX = 20;

/** Comfort profile shift in °C applied to feels-like. */
export const COMFORT_SHIFT = { "runs-cold": -2, balanced: 0, "runs-warm": 2 } as const;

/** Weather sub-penalties. */
export const RAIN_SHOE_PENALTY = 12;
export const WIND_LIGHT_TOP_PENALTY = 6;
