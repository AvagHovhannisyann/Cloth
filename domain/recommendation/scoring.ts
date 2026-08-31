import type { OccasionPreset } from "@/types/context";
import type { GarmentView } from "@/types/garment";
import type { WearRecord } from "@/types/history";
import type { OutfitView } from "@/types/outfit";
import type { ScoreBreakdown } from "@/types/recommendation";
import type { AppSettings, PreferenceState } from "@/types/settings";
import type { WeatherSnapshot } from "@/types/weather";
import { daysSinceComboWorn, daysSinceGarmentWorn } from "@/domain/history/wear";
import { scoreColorHarmony } from "./color";
import {
  BOTTOM_REPEAT_PENALTY_MAX,
  EXACT_REPEAT_PENALTY_MAX,
  FAVORITE_GARMENT_BONUS,
  FAVORITE_GARMENT_BONUS_CAP,
  FAVORITE_OUTFIT_BONUS,
  OCCASION_TAG_BONUS,
  RAIN_SHOE_PENALTY,
  TIER_BONUS,
  TOP_REPEAT_PENALTY_MAX,
  WEIGHTS,
  WIND_LIGHT_TOP_PENALTY,
} from "./constants";

/** Ideal top warmth (1–10) for a given comfort-adjusted temperature. */
export function idealTopWarmth(tempC: number): number {
  if (tempC >= 30) return 1.5;
  if (tempC >= 26) return 2;
  if (tempC >= 21) return 2.5;
  if (tempC >= 16) return 4.5;
  if (tempC >= 10) return 6.5;
  if (tempC >= 4) return 8;
  return 9;
}

/**
 * Weather suitability, 0–100. Combines position inside the outfit's declared
 * temperature band with how closely the top's warmth matches the ideal for
 * today, plus rain/wind adjustments. Neutral 70 when weather is unknown.
 */
export function scoreWeatherCompatibility(
  outfit: OutfitView,
  top: GarmentView,
  shoe: GarmentView,
  effectiveTemp: number | null,
  weather: WeatherSnapshot | null,
): number {
  if (effectiveTemp === null) return 70;

  const { min, max } = outfit.temperatureRange;
  const inset = Math.min(effectiveTemp - min, max - effectiveTemp);
  // 100 well inside the band, easing to 80 right at the edges.
  const bandScore = inset >= 3 ? 100 : 80 + (Math.max(inset, 0) / 3) * 20;

  const warmthGap = Math.abs(top.warmth - idealTopWarmth(effectiveTemp));
  const warmthScore = Math.max(0, 100 - warmthGap * 14);

  let score = bandScore * 0.45 + warmthScore * 0.55;

  if (weather) {
    const wetDay = weather.rainExpected || weather.precipitationProbability >= 55;
    if (wetDay && shoe.weather.rainFriendly === false) score -= RAIN_SHOE_PENALTY;
    if (weather.windSpeed >= 30 && top.warmth <= 2 && effectiveTemp < 22) {
      score -= WIND_LIGHT_TOP_PENALTY;
    }
  }

  return Math.max(0, Math.min(100, score));
}

/** Occasion / formality fit, 0–100. */
export function scoreFormality(outfit: OutfitView, occasion: OccasionPreset): number {
  const gap = Math.abs(outfit.formality - occasion.formalityTarget);
  return Math.max(0, 100 - gap * 12);
}

const GROUP_PAIR: Record<string, number> = {
  "classic-core|classic-core": 98,
  "classic-core|clean-casual": 90,
  "clean-casual|clean-casual": 95,
  "clean-casual|sport": 80,
  "sport|sport": 95,
  "classic-core|sport": 45,
};

function groupPair(a: string, b: string): number {
  return GROUP_PAIR[[a, b].sort().join("|")] ?? 70;
}

/**
 * Style coherence, 0–100: do the three pieces belong to the same story?
 * Considers branch compatibility and formality spread between top and bottom.
 */
export function scoreStyleCoherence(
  top: GarmentView,
  bottom: GarmentView,
  shoe: GarmentView,
): number {
  const pairScore =
    groupPair(top.styleGroup, bottom.styleGroup) * 0.55 +
    groupPair(bottom.styleGroup, shoe.styleGroup) * 0.25 +
    groupPair(top.styleGroup, shoe.styleGroup) * 0.2;

  const spread = Math.abs(top.formality - bottom.formality);
  const spreadPenalty = spread > 3 ? (spread - 3) * 6 : 0;

  return Math.max(0, Math.min(100, pairScore - spreadPenalty));
}

/**
 * Recency / variety, 0–100. Starts at 100 and takes penalties for recently
 * worn pieces. Exact-combination repeats within the cooldown are punished
 * hard; tops moderately; bottoms lightly; shoes not at all (only two pairs).
 */
export function scoreRecency(
  outfit: OutfitView,
  history: WearRecord[],
  settings: AppSettings,
  todayIso: string,
): number {
  let score = 100;

  const comboDays = daysSinceComboWorn(
    outfit.topId,
    outfit.bottomId,
    outfit.shoeId,
    history,
    todayIso,
  );
  if (comboDays !== null && comboDays < settings.exactOutfitCooldownDays) {
    const fraction = 1 - comboDays / settings.exactOutfitCooldownDays;
    score -= EXACT_REPEAT_PENALTY_MAX * fraction;
  }

  const topDays = daysSinceGarmentWorn(outfit.topId, history, todayIso);
  if (topDays !== null && topDays < settings.topCooldownDays) {
    const fraction = 1 - topDays / settings.topCooldownDays;
    score -= TOP_REPEAT_PENALTY_MAX * fraction;
  }

  const bottomDays = daysSinceGarmentWorn(outfit.bottomId, history, todayIso);
  if (bottomDays !== null && bottomDays < settings.bottomCooldownDays) {
    const fraction = 1 - bottomDays / settings.bottomCooldownDays;
    score -= BOTTOM_REPEAT_PENALTY_MAX * fraction;
  }

  return Math.max(0, score);
}

/** Learned preference, 0–100 centred on 50. Deliberately low-impact. */
export function scoreUserPreference(
  outfit: OutfitView,
  top: GarmentView,
  bottom: GarmentView,
  shoe: GarmentView,
  prefs: PreferenceState,
): number {
  const garmentDrift =
    ((prefs.garmentAffinity[top.id] ?? 0) +
      (prefs.garmentAffinity[bottom.id] ?? 0) +
      (prefs.garmentAffinity[shoe.id] ?? 0)) /
    3;
  const outfitDrift = prefs.outfitAffinity[outfit.id] ?? 0;
  return Math.max(0, Math.min(100, 50 + garmentDrift * 25 + outfitDrift * 35));
}

export interface ScoringContext {
  occasion: OccasionPreset;
  effectiveTemp: number | null;
  weather: WeatherSnapshot | null;
  history: WearRecord[];
  settings: AppSettings;
  prefs: PreferenceState;
  todayIso: string;
}

/** Full weighted breakdown for one eligible outfit. */
export function computeBreakdown(
  outfit: OutfitView,
  top: GarmentView,
  bottom: GarmentView,
  shoe: GarmentView,
  ctx: ScoringContext,
): ScoreBreakdown {
  const base = outfit.baseScore;
  const weather = scoreWeatherCompatibility(
    outfit,
    top,
    shoe,
    ctx.effectiveTemp,
    ctx.weather,
  );
  const formality = scoreFormality(outfit, ctx.occasion);
  const style = scoreStyleCoherence(top, bottom, shoe);
  const color = scoreColorHarmony(top, bottom, shoe);
  const recency = scoreRecency(outfit, ctx.history, ctx.settings, ctx.todayIso);
  const preference = scoreUserPreference(outfit, top, bottom, shoe, ctx.prefs);

  const signatureBonus = TIER_BONUS[outfit.tier];

  const favoriteGarments =
    Number(top.favorite) + Number(bottom.favorite) + Number(shoe.favorite);
  const favoriteBonus =
    (outfit.favorite ? FAVORITE_OUTFIT_BONUS : 0) +
    Math.min(favoriteGarments * FAVORITE_GARMENT_BONUS, FAVORITE_GARMENT_BONUS_CAP);

  const dominantGroup = top.styleGroup === shoe.styleGroup ? top.styleGroup : bottom.styleGroup;
  const occasionBias =
    (ctx.occasion.styleBias[dominantGroup] ?? 0) +
    (outfit.occasionTags.includes(ctx.occasion.id) ? OCCASION_TAG_BONUS : 0);

  const total =
    base * WEIGHTS.base +
    weather * WEIGHTS.weather +
    formality * WEIGHTS.formality +
    style * WEIGHTS.style +
    color * WEIGHTS.color +
    recency * WEIGHTS.recency +
    preference * WEIGHTS.preference +
    signatureBonus +
    favoriteBonus +
    occasionBias;

  return {
    base,
    weather,
    formality,
    style,
    color,
    recency,
    preference,
    signatureBonus,
    favoriteBonus,
    occasionBias,
    total: Math.round(total * 10) / 10,
  };
}
